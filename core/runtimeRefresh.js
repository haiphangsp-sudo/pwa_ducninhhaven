// core/runtimeRefresh.js

import { loadMenu } from "./menuStore.js";
import { loadPlaces } from "./placesStore.js";
import { reconcileContextAfterPlacesRefresh } from "./context.js";
import { showToast } from "../ui/render/renderAck.js";

let refreshBusy = false;
let lastRefreshAt = 0;
let intervalId = null;

const DEFAULT_MIN_GAP = 5000;
const DEFAULT_INTERVAL = 60000;

async function refreshRuntimeData(force = false) {
  const now = Date.now();

  if (refreshBusy) return false;
  if (!force && now - lastRefreshAt < DEFAULT_MIN_GAP) return false;

  refreshBusy = true;

  try {
    await Promise.all([
      loadMenu(),
      loadPlaces()
    ]);

    const result = reconcileContextAfterPlacesRefresh();

    if (result?.changed) {
      if (result.mode === "fallback-anchor") {
        showToast?.({
          type: "info",
          message: "Vị trí hiện tại không còn khả dụng, đã chuyển về vị trí gốc."
        });
      }

      if (result.mode === "cleared") {
        showToast?.({
          type: "info",
          message: "Vị trí phục vụ không còn khả dụng, vui lòng chọn lại."
        });
      }
    }

    lastRefreshAt = Date.now();
    return true;
  } catch (err) {
    console.error("[Runtime Refresh] Failed:", err);
    return false;
  } finally {
    refreshBusy = false;
  }
}

function handleVisible() {
  if (document.visibilityState === "visible") {
    refreshRuntimeData();
  }
}

function handleFocus() {
  refreshRuntimeData();
}

export function attachRuntimeRefresh(options = {}) {
  const {
    intervalMs = DEFAULT_INTERVAL,
    enableInterval = true
  } = options;

  document.addEventListener("visibilitychange", handleVisible);
  window.addEventListener("focus", handleFocus);

  if (enableInterval && intervalMs > 0) {
    intervalId = setInterval(() => {
      refreshRuntimeData();
    }, intervalMs);
  }
}

export function detachRuntimeRefresh() {
  document.removeEventListener("visibilitychange", handleVisible);
  window.removeEventListener("focus", handleFocus);

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export async function forceRuntimeRefresh() {
  return refreshRuntimeData(true);
}