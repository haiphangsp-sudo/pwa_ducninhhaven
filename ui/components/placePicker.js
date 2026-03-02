// ui/components/placePicker.js
// Component chọn vị trí (phòng/bàn) trước khi gửi yêu cầu

import { PLACES } from "../../data/places.js";
import { setContext } from "../../core/context.js";
import { t } from "../../data/i18n.js";

let el=null;

export function initPlacePicker(){

  el=document.createElement("div");
  el.id="placePicker";
  el.className="place-picker hidden";

  el.innerHTML=`
    <div class="picker-backdrop"></div>
    <div class="picker-panel">
      <h3>${t("select_place")}</h3>

      <div class="picker-group" data-type="area"></div>
      <div class="picker-group" data-type="table"></div>
    </div>
  `;

  document.body.appendChild(el);

  window.addEventListener("openPlacePicker",openPicker);
}

/* ---------- open ---------- */

function openPicker(){

  renderGroup("area",PLACES.areas);
  renderGroup("table",PLACES.tables);

  el.classList.remove("hidden");
}

/* ---------- render ---------- */

function renderGroup(type,data){

  const group=el.querySelector(`.picker-group[data-type="${type}"]`);
  if(!group) return;

  group.innerHTML=`
    <div class="picker-title">${t(type)}</div>
    <div class="picker-list">
      ${Object.entries(data).map(([id,p])=>
        `<button data-id="${id}" data-type="${type}">
          ${t(p.label)}
        </button>`
      ).join("")}
    </div>
  `;

  group.querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      setContext({
        type:btn.dataset.type,
        id:btn.dataset.id
      });
      closePicker();
    };
  });
}

/* ---------- close ---------- */

function closePicker(){
  el.classList.add("hidden");
}