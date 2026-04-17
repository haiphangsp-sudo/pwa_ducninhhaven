// core/queue.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getRetryDelay } from "../services/retryPolicy.js";
import { addOrderToTracking } from "./orders.js";

/* ---------- CONSTANTS ---------- */

const STORAGE_KEY = "haven_queue";
const MAX_QUEUE = 50;
const MAX_RETRIES = 3;

let processing = false;

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

function setFailedState(retries = 0) {
  mergeState({
    delivery: { state: "failed", retries },
    recovery: { state: "found" },
    order: {
      action: null,
      line: null,
      status: "error",
      at: null
    }
  });
}

function setSuccessState(status = "success") {
  mergeState({
    delivery: { state: "sent", retries: 0 },
    recovery: { state: "idle" },
    order: {
      action: null,
      line: null,
      status,
      at: null
    },
    cart: { items: [] }
  });
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

/* ---------- ENQUEUE ---------- */

export async function enqueue(payload) {
  const queue = loadQueue();

  if (queue.length >= MAX_QUEUE) {
    queue.shift();
  }

  queue.push({
    id: crypto.randomUUID(),
    payload,
    retries: 0,
    createdAt: Date.now()
  });

  saveQueue(queue);
  setQueuedState(0);

  if (!processing) {
    await processQueue();
  }
}

/* ---------- PROCESS ---------- */

export async function processQueue() {
  if (processing) return;

  const queue = loadQueue();
  if (queue.length === 0) {
    setIdleState();
    return;
  }

  processing = true;

  try {
    while (queue.length > 0) {
      const job = queue[0];
      const payload = job?.payload;

      if (!payload) {
        queue.shift();
        saveQueue(queue);
        continue;
      }

      setSendingState(job.retries || 0);

      try {
        const result = await sendRequest(payload);

        if (result?.success || result?.duplicate) {
          queue.shift();
          saveQueue(queue);

          try {
            addOrderToTracking(payload);
          } catch (error) {
            console.error("addOrderToTracking failed:", error);
          }

          setSuccessState(result?.duplicate ? "duplicate" : "success");

          if (queue.length > 0) {
            mergeState({
              delivery: { state: "queued", retries: 0 },
              recovery: { state: "sending" }
            });
          } else {
            clearSentStateLater();
          }

          continue;
        }

        throw new Error(result?.message || "server_logic_error");
      } catch (error) {
        console.error("Queue processing failed:", error);

        const isOfflineLike =
          error?.message === "offline" ||
          error?.message === "network" ||
          !navigator.onLine;

        if (isOfflineLike) {
          saveQueue(queue);
          setFailedState(job.retries || 0);
          return;
        }

        job.retries = Number(job.retries || 0) + 1;

        if (job.retries > MAX_RETRIES) {
          queue.shift();
          saveQueue(queue);
          setFailedState(job.retries);

          if (queue.length === 0) {
            return;
          }

          continue;
        }

        saveQueue(queue);
        setQueuedState(job.retries);

        const delay =
          typeof getRetryDelay === "function"
            ? getRetryDelay(job.retries)
            : 2000;

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIdleState();
  } finally {
    processing = false;
  }
}

/* ---------- RECOVERY ---------- */

export function detectRecovery() {
  const queue = loadQueue();
  if (queue.length === 0) return;

  setQueuedState(0);
}

/* ---------- EVENTS ---------- */

window.addEventListener("resumeQueue", () => {
  if (!processing && loadQueue().length > 0) {
    processQueue();
  }
});

window.addEventListener("online", () => {
  if (!processing && loadQueue().length > 0) {
    processQueue();
  }
});