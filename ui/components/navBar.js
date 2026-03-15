// ui/components/navBar.js
//   NAVBAR: hiển thị nơi phục vụ hiện tại, và nút chuyển ngôn ngữ
import { initLangSwitch, translate } from "../utils/translate.js";
import { getContext } from "../../core/context.js";
import { PLACES } from "../../data/places.js";
import { openPicker } from "./placePicker.js";
import { updateNavContext } from "./updateData.js";

/* ===================================================== */
  let identityIcon;
  let identityLabel;
  let locLabel;
export function renderNavBar(){

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

  identityIcon = document.querySelector(".identity-icon");
  identityLabel = document.querySelector(".identity-label");
  locLabel = document.querySelector(".loc-label");

  updateNavContext();
  initLangSwitch();
  document.querySelector(".nav-center button").onclick = openPicker;
}
/* ===================================================== */

export function getIcon(type){
  if(type === "room")  return "🛏";
  if(type === "table") return "☕ ";
  if(type === "area")  return "🌿";
  return "📍";
}

function formatLocation(ctx){

  if(!ctx?.active){
    return translate("select_place");
  }

  const {type,id} = ctx.active;
  const group = type + "s";
  const place = PLACES[group]?.[id];

  if(ctx.active.type === "room" && ctx.anchor?.type==="room" && ctx.active.id === ctx.anchor.id){
    return translate("in_room");
  }
  
  if(!place) return id;
  return translate(place.label);

}

