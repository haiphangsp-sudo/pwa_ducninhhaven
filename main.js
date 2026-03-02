// main.js
// entry point

import { subscribe } from "./core/state.js";
import { renderApp } from "./ui/renderApp.js";
import { onNetworkChange } from "./services/network.js";
import { CONFIG } from "./config.js";
import { initLangSwitch } from "./ui/langController.js";
import { resetIdleTimer } from "./core/idle.js";
import { loadMenu, MENU } from "./core/menuStore.js";
import { detectRecovery } from "./core/queue.js";
import { resolvePlace, setContext, getContext } from "./core/context.js";

/* ---------- VERSION ---------- */

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

function applyURLContext(){

  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");

  if(!placeId) return;

  const ctx = resolvePlace(placeId.toLowerCase());
  if(ctx) setContext(ctx);
}

/* ---------- SW ---------- */

function registerSW(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("/sw.js");
  }
}

/* ---------- MENU WATCH ---------- */

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

async function boot(){

  checkVersion();
  registerSW();

  await loadMenu();

  subscribe(renderApp);
  initLangSwitch();

  applyURLContext();        // ← thay cho dispatch SET_CONTEXT

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