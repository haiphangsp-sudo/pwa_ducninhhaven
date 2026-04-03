// main.js

import { CONFIG } from "./config.js";
import { loadMenu, MENU } from "./core/menuStore.js";
import { normalizeContext, applyURLContext } from "./core/context.js";
import { detectRecovery } from "./core/queue.js";
import { attachAppEvents } from "./ui/events/globalEvents.js"; 
import { attachUI } from "./ui/events/sync.js";
import { loadPlaces } from "./core/placesStore.js";
import { setState } from "./core/state.js";
import { renderApp } from "./ui/render/renderApp.js";
import { syncContextToState } from "./core/state.js";


boot();
/* ---------- VERSION ---------- */
// - Đảm bảo phiên bản SW khớp với phiên bản app
function checkVersion(){
  const stored = localStorage.getItem(CONFIG.VERSION_KEY);

  if(stored !== CONFIG.VERSION){
    localStorage.setItem(CONFIG.VERSION_KEY, CONFIG.VERSION);
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

/* ---------- MENU WATCH ---------- */
// - Theo dõi thay đổi của menu (thông qua polling), nếu có thay đổi thì render lại app để cập nhật menu mới nhất

async function watchMenu() {
  // 1. Tạo bản băm nội dung ban đầu (dùng stringify 1 lần duy nhất lúc đầu)
  let currentHash = JSON.stringify(MENU);

  setInterval(async () => {
    try {
      // 2. Tải menu mới ngầm
      await loadMenu(); 
      
      // 3. So sánh nhanh
      const nextHash = JSON.stringify(MENU);

      if (currentHash !== nextHash) {
        console.log("[Haven] Menu có sự thay đổi, đang cập nhật...");
        currentHash = nextHash;

        // 4. THAY THẾ renderApp(): Chỉ cập nhật dữ liệu vào State
        // Điều này sẽ kích hoạt syncUI mà không cần tải lại toàn bộ trang
        setState({ menu: { data: MENU, updatedAt: Date.now() } });
        
        showMenuUpdated();
      }
    } catch (err) {
      console.warn("Không thể kiểm tra cập nhật thực đơn:", err);
    }
  }, 30000); // Tăng lên 30 giây để tiết kiệm pin cho khách hàng
}
function showMenuUpdated() {
    const el = document.createElement("div");
    el.className = "menu-update-banner";
    el.textContent = "Thực đơn vừa được cập nhật";
    document.querySelector(".app-version").appendChild(el);
    setTimeout(() => el.remove(), 2500);
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
    //syncContextToState();
    attachUI(); // Gắn các listener cho state
    attachAppEvents();
    
    renderApp();
    // Bắt đầu theo dõi ngầm
    watchMenu();
    detectRecovery();
    
  } catch (criticalError) {
    // Nếu có lỗi cực nặng, hiển thị thông báo cho khách
    //document.body.innerHTML = `<div class="p-xl center">Xin lỗi, ứng dụng Haven đang gặp sự cố kết nối. Vui lòng tải lại trang.</div>`;
  }
}
