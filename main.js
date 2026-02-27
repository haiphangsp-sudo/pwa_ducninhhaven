// main.js
//Điểm vào duy nhất của app.
import { subscribe, setState } from "./core/state.js";
import { dispatch } from "./core/events.js";
import { renderApp } from "./ui/renderApp.js";
import { onNetworkChange } from "./services/network.js";
import { CONFIG } from "./config.js";
import { initLangSwitch } from "./ui/langController.js";
import { resetIdleTimer } from "./core/idle.js";

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

function boot(){

    checkVersion();
    registerSW();

    subscribe(renderApp);
    initLangSwitch();
    const context = readContext();

    dispatch("SET_CONTEXT", context);
    dispatch("GO_HOME");

    // KHÔNG tự chạy queue ở đây

    onNetworkChange((online)=>{
    if(online){
        window.dispatchEvent(new Event("networkBack"));
    }
    });

}
boot();


["touchstart","pointerdown","click"].forEach(evt=>{
  document.addEventListener(evt, resetIdleTimer, {passive:true});
});