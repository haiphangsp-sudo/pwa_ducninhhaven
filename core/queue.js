/* ---------- IMPORTS ---------- */
// core/queue.js
import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getRetryDelay } from "../services/retryPolicy.js";
import { addOrderToTracking } from "./orders.js";

/* ---------- CONSTANTS ---------- */

const STORAGE_KEY = "haven_queue";
const MAX_QUEUE = 50;
const MAX_RETRIES = 3;
const DEFAULT_UNDO_MS = 3000;

let processing = false;
let processTimer = null;

/* ---------- STORAGE ---------- */

function loadQueue() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/* ---------- STATE HELPERS ---------- */

function mergeState(patch = {}) {
  const state = getState();

  setState({
    ...(patch.delivery
      ? {
          delivery: {
            ...state.delivery,
            ...patch.delivery
          }
        }
      : {}),
    ...(patch.recovery
      ? {
          recovery: {
            ...state.recovery,
            ...patch.recovery
          }
        }
      : {}),
    ...(patch.order
      ? {
          order: {
            ...state.order,
            ...patch.order
          }
        }
      : {}),
    ...(patch.cart
      ? {
          cart: {
            ...state.cart,
            ...patch.cart
          }
        }
      : {})
  });
}

function setQueuedState(retries = 0) {
  mergeState({
    delivery: { state: "queued", retries },
    recovery: { state: "found" }
  });
}

function setSendingState(retries = 0) {
  mergeState({
    delivery: { state: "sending", retries },
    recovery: { state: "sending" },
    order: { status: "sending" }
  });
}

function setIdleState() {
  mergeState({
    delivery: { state: "idle", retries: 0 },
    recovery: { state: "idle" }
  });
}

function setFailedState(retries = 0, currentOrder = null) {
  mergeState({
    delivery: { state: "failed", retries },
    recovery: { state: "found" },
    order: {
      action: currentOrder?.action || null,
      line: currentOrder?.line || null,
      status: "error",
      at: null
    }
  });
}

function setSuccessState(status = "success", payload = null) {
  const nextPatch = {
    delivery: { state: "sent", retries: 0 },
    recovery: { state: "idle" },
    order: {
      action: null,
      line: null,
      status,
      at: null
    }
  };

  if (payload?.type === "cart") {
    nextPatch.cart = { items: [] };
  }

  mergeState(nextPatch);
}

function clearSentStateLater() {
  setTimeout(() => {
    if (loadQueue().length === 0) {
      const state = getState();
      if (state.delivery?.state === "sent") {
        setIdleState();
      }
    }
  }, 2500);
}

/* ---------- TIMER / SCHEDULER ---------- */

function clearProcessTimer() {
  if (!processTimer) return;
  clearTimeout(processTimer);
  processTimer = null;
}

function scheduleQueueProcessing(delay = 0) {
  clearProcessTimer();

  processTimer = setTimeout(() => {
    processTimer = null;
    processQueue();
  }, Math.max(0, Number(delay || 0)));
}

function getLastQueuedJob(queue = loadQueue()) {
  if (!queue.length) return null;
  return queue[queue.length - 1] || null;
}

/* ---------- ENQUEUE ---------- */

export async function enqueue(payload, meta = {}) {
  const queue = loadQueue();

  if (queue.length >= MAX_QUEUE) {
    queue.shift();
  }

  const undoMs = Number(meta.undoMs || DEFAULT_UNDO_MS);

  queue.push({
    id: crypto.randomUUID(),
    payload,
    retries: 0,
    createdAt: Date.now(),
    sourceAction: meta.sourceAction || "unknown",
    undoUntil: Date.now() + undoMs
  });

  saveQueue(queue);
  setQueuedState(0);

  scheduleQueueProcessing(undoMs);

  return {
    ok: true,
    undoMs
  };
}

/* ---------- UNDO ---------- */

export function undoLastQueuedOrder() {
  const queue = loadQueue();
  if (!queue.length) {
    return { ok: false, reason: "empty" };
  }

  const last = getLastQueuedJob(queue);
  if (!last) {
    return { ok: false, reason: "missing" };
  }

  const now = Date.now();

  if (processing || getState().delivery?.state === "sending") {
    return { ok: false, reason: "already_sending" };
  }

  if (last.undoUntil && now > last.undoUntil) {
    return { ok: false, reason: "expired" };
  }

  queue.pop();
  saveQueue(queue);
  clearProcessTimer();

  if (queue.length === 0) {
    setIdleState();
    mergeState({
      order: {
        action: null,
        line: null,
        status: "idle",
        at: null
      }
    });
  } else {
    const nextLast = getLastQueuedJob(queue);
    const delay = Math.max(0, Number((nextLast?.undoUntil || now) - now));
    setQueuedState(0);
    scheduleQueueProcessing(delay);
  }

  return {
    ok: true,
    sourceAction: last.sourceAction || "unknown",
    payload: last.payload || null
  };
}

/* ---------- PROCESS ---------- */

export async function processQueue() {
  if (processing) return;

  const queue = loadQueue();
  if (queue.length === 0) {
    clearProcessTimer();
    setIdleState();
    return;
  }

  const job = queue[0];
  if (!job) {
    clearProcessTimer();
    setIdleState();
    return;
  }

  const now = Date.now();

  // Còn trong thời gian cho phép Undo
  if (job.undoUntil && now < job.undoUntil) {
    setQueuedState(job.retries || 0);
    scheduleQueueProcessing(job.undoUntil - now);
    return;
  }

  if (!job.payload) {
    queue.shift();
    saveQueue(queue);

    if (queue.length > 0) {
      scheduleQueueProcessing(0);
    } else {
      clearProcessTimer();
      setIdleState();
    }
    return;
  }

  processing = true;
  clearProcessTimer();

  try {
    setSendingState(job.retries || 0);

    const result = await sendRequest(job.payload);

    if (result?.success || result?.duplicate) {
      const nextQueue = loadQueue();
      nextQueue.shift();
      saveQueue(nextQueue);

      try {
        addOrderToTracking(job.payload);
      } catch (error) {
        console.error("addOrderToTracking failed:", error);
      }

      setSuccessState(result?.duplicate ? "duplicate" : "success", job.payload);

      if (nextQueue.length > 0) {
        const nextJob = nextQueue[0];
        const delay = Math.max(
          0,
          Number((nextJob?.undoUntil || Date.now()) - Date.now())
        );

        mergeState({
          delivery: { state: "queued", retries: 0 },
          recovery: { state: "found" }
        });

        scheduleQueueProcessing(delay);
      } else {
        clearSentStateLater();
      }

      return;
    }

    throw new Error(result?.message || "server_logic_error");
  } catch (error) {
    console.error("Queue processing failed:", error);

    const isOfflineLike =
      error?.message === "offline" ||
      error?.message === "network" ||
      !navigator.onLine;

    const currentQueue = loadQueue();
    const currentJob = currentQueue[0];

    if (!currentJob) {
      clearProcessTimer();
      setIdleState();
      return;
    }

    if (isOfflineLike) {
      saveQueue(currentQueue);
      setQueuedState(currentJob.retries || 0);
      return;
    }

    currentJob.retries = Number(currentJob.retries || 0) + 1;

    if (currentJob.retries > MAX_RETRIES) {
      currentQueue.shift();
      saveQueue(currentQueue);
      
      setFailedState(currentJob.retries, {
        action: currentJob.sourceAction,
        line: currentJob.payload?.items?.length === 1
        ? currentJob.payload.items[0]?.id || null
        : null
      });
      
      if (currentQueue.length > 0) {
        scheduleQueueProcessing(300);
      }

      return;
    }

    saveQueue(currentQueue);
    setQueuedState(currentJob.retries);

    const delay =
      typeof getRetryDelay === "function"
        ? getRetryDelay(currentJob.retries)
        : 2000;

    scheduleQueueProcessing(delay);
  } finally {
    processing = false;
  }
}

/* ---------- RECOVERY ---------- */

export function detectRecovery() {
  const queue = loadQueue();
  if (queue.length === 0) return false;

  const first = queue[0];
  const now = Date.now();
  const delay = Math.max(0, Number((first?.undoUntil || now) - now));

  setQueuedState(0);
  scheduleQueueProcessing(delay);
  return true;
}

/* ---------- DEBUG / INFO ---------- */

export function getQueuedJobs() {
  return loadQueue();
}

export function clearQueue() {
  clearProcessTimer();
  saveQueue([]);
  setIdleState();

  mergeState({
    order: {
      action: null,
      line: null,
      status: "idle",
      at: null
    }
  });
}

/* ---------- EVENTS ---------- */

window.addEventListener("resumeQueue", () => {
  if (loadQueue().length === 0) return;

  const queue = loadQueue();
  const first = queue[0];
  const delay = Math.max(
    0,
    Number((first?.undoUntil || Date.now()) - Date.now())
  );

  if (!processing) {
    scheduleQueueProcessing(delay);
  }
});

window.addEventListener("online", () => {
  const queue = loadQueue();
  if (!queue.length) return;

  const first = queue[0];
  const delay = Math.max(
    0,
    Number((first?.undoUntil || Date.now()) - Date.now())
  );

  if (!processing) {
    scheduleQueueProcessing(delay);
  }
});