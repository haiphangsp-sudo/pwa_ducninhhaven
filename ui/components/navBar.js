// ui/components/navBar.js
//   NAVBAR: hiển thị nơi phục vụ hiện tại, và nút chuyển ngôn ngữ



import { initLangSwitch } from "../langController.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";

/* ===================================================== */

export function renderNavBar(){

  const el = document.getElementById("contextBar");
  if(!el) return;

  el.innerHTML = `
    <div class="nav">
      <div class="nav-bar nav-left">Haven</div>

      <div class="nav-bar nav-center">
        <button class="context-btn">
          
        </button>
      </div>

      <div class="nav-bar nav-right">
        <div id="langSwitch" class="lang-switch">
          <button data-lang="vi">VI</button>
          <button data-lang="en">EN</button>
        </div>
      </div>
    </div>
  `;
  renderLeft();
  initLangSwitch();
  renderCenter();
  bindCenterClick();
}
/* ===================================================== */

function renderLeft(){
  const label = "guest";
  const nl = document.querySelector(".nav-left");
  if(anchor?.type==="room") {
    label=anchor.id;
  }
  if(anchor?.type==="table") {
    label="table_guest";
  }
  if(anchor?.type==="area") {
    label="area_guest";
  }
  nl.innerHTML = `<span class="identity-label">${translate(label)}</span>`;
}

/* ===================================================== */
/* CENTER: hiển thị nơi phục vụ hiện tại */

function renderCenter(){
  const ctx = getContext();
  const anchor = ctx?.anchor;
  const active = ctx?.active;
  const el = document.querySelector(".nav-center button");
  
  if(!el) return;
  let label="select_place";
  if(!active){
    if( active.type === "room"&&anchor?.type==="room"&&anchor.id === active.id){
      label = "in_room";
    }else{
      label = active.id;
    }
  }
    el.innerHTML = `
    <span class="ctx-icon">${icon(active.type)}</span>
      <span class="no-context">${translate(label)};</span>
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

  const el = document.querySelector(".nav-center button");
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