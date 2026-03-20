// main.js
// Ứng dụng chính, khởi tạo và kết nối các phần với nhau
// entry point

import { subscribe } from "./core/state.js";
import { renderApp } from "./ui/render/renderApp.js";
import { CONFIG } from "./config.js";
import { loadMenu, MENU } from "./core/menuStore.js";
import { applyEntryPlaceById, normalizeContext } from "./core/context.js";
import { loadCart } from "./core/events.js";
import { detectRecovery } from "./core/queue.js";
import { loadPlaces } from "./core/placesStore.js";
import { attachAppEvents } from "./ui/events/globalEvents.js"; 
   

boot();
/* ---------- VERSION ---------- */
// - Đảm bảo phiên bản SW khớp với phiên bản app
function checkVersion(){
  const stored = localStorage.getItem("app_version");

  if(stored !== CONFIG.VERSION){
    localStorage.setItem("app_version", CONFIG.VERSION);
    if("caches" in window){
      caches.keys().then(keys=>{
        keys.forEach(k=>caches.delete(k));
      });
    }
    location.reload();
  }
  document.querySelector(".app-version").textContent = `v${CONFIG.VERSION}`;
}

/* ---------- READ QR ---------- */
// - Nếu URL có param "place", giải mã và lưu vào context để dùng cho các thao tác sau này (gửi yêu cầu, hiển thị ở nav, ...)

function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");

  if (!placeId) return;

  applyEntryPlaceById(placeId);
  history.replaceState({}, "", location.pathname);
}
/* ---------- SW ---------- */
// - Đăng ký Service Worker để hỗ trợ offline và background sync
function registerSW(){
  if(!"serviceWorker" in navigator) return;
    navigator.serviceWorker.register("/sw.js?v="+CONFIG.VERSION).then(reg=>{
      reg.addEventListener("updatefound", ()=>{
        const newSW = reg.installing;
        newSW.addEventListener("statechange", ()=>{
          if(newSW.state === "installed" && navigator.serviceWorker.controller){
            // Có SW mới, reload để cập nhật
            location.reload();
          }
        });
      });
    }).catch(err=>{
      console.error("SW registration failed:", err);
    });
}

/* ---------- MENU WATCH ---------- */
// - Theo dõi thay đổi của menu (thông qua polling), nếu có thay đổi thì render lại app để cập nhật menu mới nhất
async function watchMenu() {

  window.__menuHash = JSON.stringify(MENU);

  setInterval(async () => {
    const old = window.__menuHash;

    await loadMenu();
    
    const next = JSON.stringify(MENU);

    if (old !== next) {
      renderApp();
      window.__menuHash = next;
      showMenuUpdated();
    }

  }, 10000);

  function showMenuUpdated() {
    const el = document.createElement("div");
    el.className = "menu-update-banner";
    el.textContent = "Thực đơn vừa được cập nhật";
    document.getSelection(".app-version").appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

/* ---------- BOOT ---------- */
// - Hàm khởi động ứng dụng, chạy tất cả các thiết lập cần thiết và render giao diện lần đầu
async function boot() {

  checkVersion();
  registerSW();

  await loadMenu();
  await loadPlaces();
  applyURLContext();   // ← phải chạy trước render
  normalizeContext(); // đảm bảo context được lưu lại với timestamp mới, tránh bị xoá do TTL
  
  loadCart();
  detectRecovery();
  renderApp();
  attachAppEvents();
  watchMenu();
  subscribe(renderApp);
}
