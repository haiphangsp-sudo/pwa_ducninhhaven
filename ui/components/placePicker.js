// ui/components/placePicker.js
// Component cho phép khách chọn điểm phục vụ (phòng/bàn/khu vực) thủ công, nếu QR code không hoạt động hoặc khách muốn đổi điểm phục vụ

import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { getIcon } from "./navBar.js"; 
import { PLACES } from "../../data/places.js";
import { setActive } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { getState } from "../../core/state.js";


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
  const a = getState().context;
  const anchor = a.anchor;
  const active = a.active;
  if (anchor === "room") {
    const myRoom ={...PLACES.room[active.room]}
    renderGroup("room", PLACES.room[myRoom]);
    renderGroup("table", PLACES.table);
    renderGroup("area", PLACES.area);
  } else if (anchor?.type === "area") {
    renderGroup("area", PLACES.area);
    renderGroup("table", PLACES.table);
    clearGroup("room");
  } else {
    renderGroup("table", PLACES.table);
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
