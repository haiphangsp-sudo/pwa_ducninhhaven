// ui/components/placePicker.js
// Component cho phép khách chọn điểm phục vụ (phòng/bàn/khu vực) thủ công, nếu QR code không hoạt động hoặc khách muốn đổi điểm phục vụ


import { getIcon } from "./navBar.js"; 
import { PLACES } from "../../data/places.js";
import { setActive, getAnchor } from "../../core/context.js";
import { translate } from "../utils/translate.js";

const el=document.getElementById("placePicker");

/* -------------------------------------------------- */

export function initPlacePicker(){
  el.innerHTML=`
    <div class="picker-backdrop"></div>
    <div class="picker-panel stack">
      <h3>${translate("select_place")}</h3>
      <div class="picker-group grid" data-group="room"></div>
      <div class="picker-group grid" data-group="table"></div>
      <div class="picker-group grid" data-group="area"></div>
    </div>
  `;
  window.addEventListener("openPlacePicker",openPicker);
  el.querySelector(".picker-backdrop").onclick=closePicker;
}
/* -------------------------------------------------- */

function openPicker(){

  const anchor=getAnchor();

  // phòng chỉ hiện nếu khách phòng
  if(anchor?.type==="room")
    renderGroup("room",{[anchor.id]:PLACES.rooms[anchor.id]});
  else
    clearGroup("room");

  renderGroup("table",PLACES.tables);
  renderGroup("area",PLACES.areas);

  el.classList.remove("hidden");
}
/* -------------------------------------------------- */

function renderGroup(type,data){

  const group=el.querySelector(`[data-group="${type}"]`);
  if(!group) return;

  group.innerHTML =`
    <div class="flex gap-s">
      <span class="${type}-icon">${getIcon(type)}</span>
      <span class="picker-title">${translate(type)}</span>
    </div>
    <div class="picker-list">
      ${Object.entries(data).map(([id,p])=>`
        <button class="btn-primary btn" data-type="${type}" data-id="${id}">
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
      closePicker();
    };
  });
}

function clearGroup(type){
  const group=el.querySelector(`[data-group="${type}"]`);
  if(group) group.innerHTML="";
}
/* -------------------------------------------------- */

function closePicker(){
  el.classList.add("hidden");
}