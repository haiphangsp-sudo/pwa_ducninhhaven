// ui/components/navBar.js
//   NAVBAR: hiển thị nơi phục vụ hiện tại, và nút chuyển ngôn ngữ



import { initLangSwitch } from "../langController.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { PLACES } from "../../data/places.js";

/* ===================================================== */

export function renderNavBar(){

  const el = document.getElementById("contextBar");
  if(!el) return;

  el.innerHTML = `
    <div class="nav">
      <div class="nav-bar nav-left">Haven</div>
      <div class="nav-bar nav-center">
        <button class="location-btn"></button>
      </div>

      <div class="nav-bar nav-right">
        <div id="langSwitch" class="lang-switch">
          <button data-lang="vi">VI</button>
          <button data-lang="en">EN</button>
        </div>
      </div>
    </div>
  `;
  render();
  initLangSwitch();
  bindClick();
}


function render(){
  let labelLeft="table_guest"; // mặc định là khách bàn, nếu không có anchor thì coi như khách vãng lai
  const nl = document.querySelector(".nav-left");
  if(!nl) return;
  const ctx = getContext();
  const anchor = ctx?.anchor;
  const active = ctx?.active;

  if(anchor?.type==="room") {
    labelLeft=anchor.id;
  }
  if(anchor?.type==="table") {
    labelLeft="table_guest";
  }
  if(anchor?.type==="area") {
    labelLeft="area_guest";
  }

  nl.innerHTML = `<span class="identity-icon">${icon(anchor?.type)}</span>
  <span class="identity-label">${translate(labelLeft)}</span>`;


/* ===================================================== */
/* CENTER: hiển thị nơi phục vụ hiện tại */
  
    const el = document.querySelector(".nav-center button");
  
    el.innerHTML = `<span class="loc-label">${formatLocation(ctx)}</span>
      <span class="loc-arrow">▾</span>`;
}

/* ===================================================== */

function icon(type){
  if(type === "room")  return "🛏";
  if(type === "table") return "🍽";
  if(type === "area")  return "📍";
  return "👤";
}
function formatLocation(ctx){
  if(!ctx?.active){// chưa có nơi phục vụ nào → khách vãng lai
    return translate("select_place");
  }
  if(ctx.active.type === "room" && ctx.anchor?.type==="room" && ctx.active.id === ctx.anchor.id){
    return translate("in_room");
  }// ưu tiên hiển thị anchor nếu đang ở phòng, vì đó là nơi phục vụ chính
  const {type,id} = ctx.active;
  const group = type + "s";
  const place = PLACES[group]?.[id];
  if(!place) return id;
  return translate(place.label);

}
/* ===================================================== */
/* INTERACTION */

function bindClick(){

  const el = document.querySelector(".nav-center button");
  if(!el) return;

  el.onclick = ()=>{
    window.dispatchEvent(new Event("openPlacePicker"));
  };
}

/* ===================================================== */
/* EXTERNAL REFRESH */

export function updateNavContext(){
  render();
}