// ui/components/placePicker.js
// Component cho phép khách chọn điểm phục vụ (phòng/bàn/khu vực) thủ công, nếu QR code không hoạt động hoặc khách muốn đổi điểm phục vụ

import { showOverlay, closeOverlay } from "../../ui/interactions/overlayManager.js";
import { getIcon } from "./navBar.js"; 
import { PLACES } from "../../data/places.js";
import { setActive, getAnchor } from "../../core/context.js";
import { translate } from "../utils/translate.js";



/* -------------------------------------------------- */

function initPlacePicker() {
  const el=document.getElementById("placePicker");
  el.innerHTML=`
    <div class="picker-panel">
      <h3 class="picker-panel_title"></h3>
      <div class="picker-group grid" data-group="room"></div>
      <div class="picker-group grid" data-group="table"></div>
      <div class="picker-group grid" data-group="area"></div>
    </div>
  `;
}
/* -------------------------------------------------- */

export function openPicker(){
  initPlacePicker()
  const anchor=getAnchor();
  
  if (anchor?.type === "room") {
    renderGroup("room", { [anchor.id]: PLACES.rooms[anchor.id] });
    renderGroup("table", PLACES.tables);
    renderGroup("area", PLACES.areas);
  } else if (anchor?.type === "area") {
    renderGroup("area", PLACES.areas);
    renderGroup("table", PLACES.tables);
    clearGroup("room");
  } else {
    renderGroup("table", PLACES.tables);
    clearGroup("room");
    clearGroup("area");
  }
  showOverlay("placePicker");
}
/* -------------------------------------------------- */

function renderGroup(type,data){
  
  const group=document.querySelector(`[data-group="${type}"]`);
  if(!group) return;

  group.innerHTML =`
    <div class="flex gap-s">
      <span class="${type}-icon">${getIcon(type)}</span>
      <span class="picker-title">${translate(type)}</span>
    </div>
    <div class="picker-list">
      ${Object.entries(data).map(([id,p])=>`
        <button class="picker-option btn center" data-type="${type}" data-id="${id}">
          ${translate(p.label)}
        </button>
      `).join("")}
    </div>
  `;
  
 
  group.querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      setActive({
        type:btn.dataset.type,
        id:btn.dataset.id
      });
        closeOverlay();
    };
  });
  document.querySelector(".picker-panel_title").textContent = translate("select_place");
  closeOverlay();
}

function clearGroup(type){
  const group=document.querySelector(`[data-group="${type}"]`);
  if(group) group.innerHTML="";
}
/* -------------------------------------------------- */
