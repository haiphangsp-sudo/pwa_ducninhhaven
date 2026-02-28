// main.js
//Điểm vào duy nhất của app.
import { subscribe, setState } from "./core/state.js";
import { dispatch } from "./core/events.js";
import { renderApp } from "./ui/renderApp.js";
import { onNetworkChange } from "./services/network.js";
import { CONFIG } from "./config.js";
import { initLangSwitch } from "./ui/langController.js";
import { resetIdleTimer } from "./core/idle.js";
import { loadMenu } from "./core/menuStore.js";
import { MENU } from "./data/menu.js";

/* ---------- VERSION CONTROL ---------- */

function checkVersion(){

  const stored = localStorage.getItem("app_version");

  if(stored !== CONFIG.VERSION){
    localStorage.setItem("app_version", CONFIG.VERSION);
    if("caches" in window){
      caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));
    }
  }

}

/* ---------- QR CONTEXT ---------- */

function readContext(){

  const params = new URLSearchParams(location.search);

  return {
    mode: params.get("mode") || "room",
    place: params.get("place") || "Oliver"
  };

}

/* ---------- SERVICE WORKER ---------- */

function registerSW(){

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js");
  }

}

/* ---------- BOOT ---------- */
async function boot(){

  checkVersion();
  registerSW();

  await loadMenu();              // 1️⃣ nạp dữ liệu trước

  subscribe(renderApp);          // 2️⃣ sau đó mới cho phép render
  initLangSwitch();

  const context = readContext();
  dispatch("SET_CONTEXT", context);
  dispatch("GO_HOME");

  onNetworkChange((online)=>{
    if(online){
      window.dispatchEvent(new Event("networkBack"));
    }
  });
  if("serviceWorker" in navigator){
  navigator.serviceWorker.register("/sw.js").then(reg=>{
    reg.update();
  });
}

  renderApp();                   // 3️⃣ render lần đầu khi đã có MENU
  window.__menuHash = JSON.stringify(MENU);
}
boot();
window.addEventListener("visibilitychange", async ()=>{

  if(document.visibilityState!=="visible") return;

  const oldHash = window.__menuHash;   // 1. nhớ menu cũ

  await loadMenu();                    // 2. nạp menu mới
  renderApp();

  const newHash = JSON.stringify(MENU); // 3. so sánh sau khi nạp

  if(oldHash && oldHash !== newHash){
    showMenuUpdated();
  }

  window.__menuHash = newHash;         // 4. lưu lại
});

["touchstart","pointerdown","click"].forEach(evt=>{
  document.addEventListener(evt, resetIdleTimer, {passive:true});
});
function showMenuUpdated(){
  const el=document.createElement("div");
  el.className="menu-update-banner";
  el.textContent="Thực đơn vừa được cập nhật";
  document.body.appendChild(el);

  setTimeout(()=>el.remove(),2500);
}