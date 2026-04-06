// main.js

import { CONFIG } from "./config.js";
import { loadMenu } from "./core/menuStore.js";
import { loadPlaces } from "./core/placesStore.js";
import { normalizeContext, applyURLContext, syncContextToState } from "./core/context.js";
import { detectRecovery } from "./core/queue.js";
import { attachAppEvents } from "./ui/events/globalEvents.js"; 
import { attachUI } from "./ui/events/sync.js";
import { renderApp } from "./ui/render/renderApp.js";
import { setState } from "./core/state.js";



boot();
/* ---------- VERSION ---------- */
// - Đảm bảo phiên bản SW khớp với phiên bản app
function checkVersion(){
  const stored = localStorage.getItem(CONFIG.APP_VERSION_KEY);

  if(stored !== CONFIG.VERSION){
    localStorage.setItem(CONFIG.APP_VERSION_KEY, CONFIG.VERSION);
    if("caches" in window){
      caches.keys().then(keys=>{
        keys.forEach(k=>caches.delete(k));
      });
    }
    location.reload();
  }
  document.querySelector(".app-version").textContent = `v${CONFIG.VERSION}`;
}

/* ---------- SW ---------- */
// - Đăng ký Service Worker để hỗ trợ offline và background sync
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
        if (
          newSW.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
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
    setState({
        cart: {
          items: []
        }
      });
  }
}

/* ---------- BOOT ---------- */

async function boot() {
  try {
    checkVersion();
    registerSW();
    
    // Chạy song song để tăng tốc độ khởi động
    await Promise.all([
      loadMenu().catch(e => console.error("Lỗi menu:", e)),
      loadPlaces().catch(e => console.error("Lỗi vị trí:", e))
    ]);
    
    
  
    loadCart();
    normalizeContext();
    applyURLContext();
    syncContextToState();
    attachUI(); // Gắn các listener cho state
    attachAppEvents();
    
    renderApp();
    detectRecovery();
    
  } catch (criticalError) {
    // Nếu có lỗi cực nặng, hiển thị thông báo cho khách
    document.body.innerHTML = `<div class="p-xl center">Xin lỗi, ứng dụng Haven đang gặp sự cố kết nối. Vui lòng tải lại trang.</div>`;
  }
}
