// main.js
// Ứng dụng chính, khởi tạo và kết nối các phần với nhau
// entry point

import { subscribe } from "./core/state.js";
import { renderApp } from "./ui/renderApp.js";
import { onNetworkChange } from "./services/network.js";
import { CONFIG } from "./config.js";
import { initLangSwitch } from "./ui/langController.js";
import { resetIdleTimer } from "./core/idle.js";
import { loadMenu, MENU } from "./core/menuStore.js";
import { detectRecovery } from "./core/queue.js";
import { resolvePlace, setAnchor } from "./core/context.js";
import { initPlacePicker } from "./ui/components/placePicker.js";

/* ---------- VERSION ---------- */
// - Đảm bảo phiên bản SW khớp với phiên bản app
function checkVersion(){
  const stored = localStorage.getItem("app_version");

  if(stored !== CONFIG.VERSION){
    localStorage.setItem("app_version", CONFIG.VERSION);
    if("caches" in window){
      caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));
    }
  }
}

/* ---------- READ QR ---------- */
// - Nếu URL có param "place", giải mã và lưu vào context để dùng cho các thao tác sau này (gửi yêu cầu, hiển thị ở nav, ...)
function applyURLContext(){

  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  if(!placeId) return;

  const place = resolvePlace(placeId.toLowerCase());
  if(place){
    setAnchor(place);
  }

  // quan trọng: xoá param để tránh reset khi reload
  history.replaceState({}, "", location.pathname);
}

/* ---------- SW ---------- */
// - Đăng ký Service Worker để hỗ trợ offline và background sync
function registerSW(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("/sw.js");
  }
}

/* ---------- MENU WATCH ---------- */
// - Theo dõi thay đổi của menu (thông qua polling), nếu có thay đổi thì render lại app để cập nhật menu mới nhất
async function watchMenu(){

  window.__menuHash = JSON.stringify(MENU);

  setInterval(async ()=>{
    const old = window.__menuHash;

    await loadMenu();
    const next = JSON.stringify(MENU);

    if(old !== next){
      renderApp();
      window.__menuHash = next;
      showMenuUpdated();
    }

  },10000);
}

function showMenuUpdated(){
  const el=document.createElement("div");
  el.className="menu-update-banner";
  el.textContent="Thực đơn vừa được cập nhật";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2500);
}

/* ---------- BOOT ---------- */
// - Hàm khởi động ứng dụng, chạy tất cả các thiết lập cần thiết và render giao diện lần đầu
async function boot(){

  checkVersion();
  registerSW();

  await loadMenu();

  applyURLContext();   // ← phải chạy trước render

  subscribe(renderApp);
  initLangSwitch();
  initPlacePicker();

  renderApp();
  detectRecovery();

  onNetworkChange(online=>{
    if(online)
      window.dispatchEvent(new Event("networkBack"));
  });

  ["touchstart","pointerdown","click"].forEach(evt=>{
    document.addEventListener(evt, resetIdleTimer, {passive:true});
  });

  watchMenu();
}

boot();