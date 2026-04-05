// core/runtimeRefresh.js

import { loadMenu } from "./menuStore.js";
import { loadPlaces } from "./placesStore.js";

let refreshBusy = false;
let lastRefreshAt = 0;
let intervalId = null;

const DEFAULT_MIN_GAP = 5000;     // chống refresh dồn dập
const DEFAULT_INTERVAL = 60000;   // polling 60 giây

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