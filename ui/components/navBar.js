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
      <div class="nav-bar nav-left">
        <span class="identity-icon"></span>
        <span class="identity-label"></span>
      </div>
      <div class="nav-bar nav-center">
        <button class="location-btn">
          <span class="loc-label"></span>
          <span class="loc-arrow">▾</span>
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
  updateText();
  initLangSwitch();
  bindClick();
}

// Cập nhật NAVBAR khi context thay đổi, ví dụ sau khi quét QR hoặc chọn nơi phục vụ mới
function updateText(){
  let labelLeft="table_guest"; 
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

  document.querySelector(".identity-icon").textContent = icon(anchor?.type);
  document.querySelector(".identity-label").textContent = translate(labelLeft);
  document.querySelector(".loc-label").textContent = formatLocation(ctx);
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
  updateText();
}