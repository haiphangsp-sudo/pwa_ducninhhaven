// ui/components/navBar.js
//   NAVBAR: hiển thị nơi phục vụ hiện tại, và nút chuyển ngôn ngữ



import { initLangSwitch } from "../langController.js";
import { getContext } from "../../core/context.js";
import { PLACES } from "../../data/places.js";
import { translate } from "../utils/translate.js";

/* ===================================================== */

export function renderNavBar(){

  const el = document.getElementById("contextBar");
  if(!el) return;

  el.innerHTML = `
    <div class="nav">
      <div class="nav-bar nav-left">Haven</div>

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

/* ===================================================== */
/* CENTER: hiển thị nơi phục vụ hiện tại */

function renderCenter(){

  const el = document.querySelector(".nav-center");
  if(!el) return;

  const ctx = getContext();
  const active = ctx?.active;

  if(!active){
    el.innerHTML = `
      <span class="no-context">
        ${translate("select_place")}
      </span>
    `;
    return;
  }

  const group = PLACES[active.type + "s"];
  const place = group?.[active.id];

  if(!place){
    el.innerHTML = `
      <span class="no-context">
        ${translate("select_place")}
      </span>
    `;
    return;
  }
  if(active.type === "room"&&
    active.anchor?.type==="room"){
    place.label = `${translate("in_room")}`;
  }
  el.innerHTML = `
    <span class="ctx-icon">${icon(active.type)}</span>
    <span class="ctx-label">${translate(place.label)}</span>
  `;
}

/* ===================================================== */

function icon(type){
  if(type === "room")  return "🛏";
  if(type === "table") return "🍽";
  if(type === "area")  return "📍";
  return "";
}

/* ===================================================== */
/* INTERACTION */

function bindCenterClick(){

  const el = document.querySelector(".nav-center");
  if(!el) return;

  el.onclick = ()=>{
    window.dispatchEvent(new Event("openPlacePicker"));
  };
}

/* ===================================================== */
/* EXTERNAL REFRESH */

export function updateNavContext(){
  renderCenter();
}