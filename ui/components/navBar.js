import { initLangSwitch } from "../langController.js";
import { getContext } from "../../core/context.js";
import { PLACES } from "../../data/places.js";
import { translate } from "../utils/translate.js";

export function renderNavBar(){

  const el = document.getElementById("contextBar");

  el.innerHTML = `
    <div class="nav">
      <div class="nav-bar nav-left">Duc Ninh Haven</div>
      <div class="nav-bar nav-center"></div>
      <div class="nav-bar nav-right">
        <div id="langSwitch" class="lang-switch">
          <button data-lang="vi">VI</button>
          <button data-lang="en">EN</button>
        </div>
      </div>
    </div>
  `;

  initLangSwitch();
  renderCenter();
  bindCenterClick();
}

/* ---------- center (service context) ---------- */

function renderCenter(){

  const el = document.querySelector(".nav-center");
  if(!el) return;

  const ctx = getContext();

  if(!ctx){
    el.innerHTML = `<span class="no-context">${translate("choose_place")}</span>`;
    return;
  }

  const place = PLACES[ctx.type+"s"][ctx.id];
  el.innerHTML = `
    <span class="ctx-icon">${icon(ctx.type)}</span>
    <span class="ctx-label">${translate(place.label)}</span>
  `;
}

function icon(type){
  if(type==="room") return "🛏";
  if(type==="table") return "🍽";
  return "📍";
}

/* ---------- interactions ---------- */

function bindCenterClick(){
  const el=document.querySelector(".nav-center");
  if(!el) return;

  el.onclick = ()=>{
    window.dispatchEvent(new Event("openPlacePicker"));
  };
}

/* ---------- external refresh ---------- */

export function updateNavContext(){
  renderCenter();
}