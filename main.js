// main.js

import { CONFIG } from "./config.js";
import { loadMenu } from "./core/menuStore.js";
import { loadPlaces } from "./core/placesStore.js";
import { normalizeContext, applyURLContext, syncContextToState } from "./core/context.js";
import { detectRecovery } from "./core/queue.js";
import { attachUI } from "./ui/events/syncmoi.js";
import { renderApp } from "./ui/render/renderApp.js";
import { setState } from "./core/state.js";
import { bootstrapApp } from "./core/bootstrap.js";

boot();

function checkVersion() {
  const stored = localStorage.getItem(CONFIG.APP_VERSION_KEY);

  if (stored !== CONFIG.VERSION) {
    localStorage.setItem(CONFIG.APP_VERSION_KEY, CONFIG.VERSION);

    if ("caches" in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }

    location.reload();
    return false;
  }

  document.querySelector(".app-version").textContent = `v${CONFIG.VERSION}`;
  return true;
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register(`/sw.js?v=${CONFIG.VERSION}`, {
    type: "module",
    updateViaCache: "none"
  }).then(reg => {
    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });

    reg.addEventListener("updatefound", () => {
      const newSW = reg.installing;
      if (!newSW) return;

      newSW.addEventListener("statechange", () => {
        if (newSW.state === "installed" && navigator.serviceWorker.controller) {
          newSW.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }).catch(err => {
    console.error("SW registration failed:", err);
  });
}

function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CONFIG.CART_KEY) || "[]");
    setState({ cart: { items } });
  } catch {
    setState({ cart: { items: [] } });
  }
}

function restoreRuntimeState() {
  loadCart();
  normalizeContext();
  applyURLContext();
  syncContextToState();
}

async function loadAppData() {
  await Promise.all([
    loadMenu().catch(err => console.error("Lỗi menu:", err)),
    loadPlaces().catch(err => console.error("Lỗi vị trí:", err))
  ]);
}

function mountApp() {
  const state = bootstrapApp();
  renderApp(state);
  attachUI();
  detectRecovery();
}

async function boot() {
  try {
    const shouldContinue = checkVersion();
    if (!shouldContinue) return;

    registerSW();
    await loadAppData();
    restoreRuntimeState();
    mountApp();
  } catch (error) {
    console.error("Boot failed:", error);
    document.body.innerHTML =
      `<div class="p-xl center">Xin lỗi, ứng dụng Haven đang gặp sự cố kết nối. Vui lòng tải lại trang.</div>`;
  }
}