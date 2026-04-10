// core/queue.js

import { sendRequest } from "../services/api.js";
import { getRetryDelay } from "../services/retryPolicy.js";
import { setDeliveryState } from "../ui/render/renderDelivery.js";
import { setRecoveryState } from "../ui/render/renderRecovery.js";

/* ---------- CONSTANTS ---------- */

const STORAGE_KEY = "haven_queue";
const MAX_QUEUE = 50;
const MAX_RETRIES = 3;
let processing = false;

/* ---------- STORAGE ---------- */

function loadQueue() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveQueue(q) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
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
  setDeliveryState("queued");

  if (!processing) processQueue();
}

/* ---------- PROCESS ---------- */

export async function processQueue() {
  if (processing) return;

  const queue = loadQueue();
  if (queue.length === 0) {
    processing = false;
    return;
  }

  processing = true;

  while (queue.length > 0) {
    const req = queue[0];
    const job = req.payload;

    try {
      setDeliveryState("sending");

      const body = {
        id: req.id,
        device: navigator.userAgent,
        time: Date.now(),
        ...job
      };

      const result = await sendRequest(body);

      if (result && result.success === true) {
        if (queue.length === 1) {
          //finalizeOrderSuccess("recovery"); 
        }
        queue.shift();
        saveQueue(queue);

        if (queue.length === 0) {
          setDeliveryState("sent");
          if (navigator.vibrate) navigator.vibrate(50);

          setTimeout(() => {
            setDeliveryState("idle");
            setRecoveryState("idle");
          }, 2500);
        }

        continue;
      }

      throw new Error(result?.message || "server_logic_error");

    } catch (e) {
      console.error("Queue Error:", e);

      if (e.message === "offline" || e.message === "network" || !navigator.onLine) {
        setDeliveryState("failed");
        processing = false;
        return;
      }

      req.retries += 1;

      if (req.retries > MAX_RETRIES) {
        queue.shift();
        saveQueue(queue);
        setDeliveryState("failed");
      } else {
        saveQueue(queue);
        setDeliveryState("queued");
        const delay = getRetryDelay(req.retries);
        await new Promise(res => setTimeout(res, delay));
      }
      break;
    }
  }
  processing = false;
}

/* ---------- RECOVERY ---------- */

export function detectRecovery() {
  const q = loadQueue();
  if (q.length > 0) {
    setRecoveryState("found");
  }
}

/* ---------- EVENTS ---------- */

window.addEventListener("resumeQueue", () => {
  if (!processing) processQueue();
});

window.addEventListener("online", () => {
  if (loadQueue().length > 0) {
    processQueue();
  }
});