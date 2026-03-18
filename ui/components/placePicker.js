//  ui/components/placePicker.js


import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { getIcon } from "./navBar.js";
import { PLACES , PLACE_RULES } from "../../data/places.js";
import { getContext, applyPlaceById } from "../../core/context.js";
import { translate } from "../utils/translate.js";


/* ---------- INIT ---------- */

function initPlacePicker() {
  const el = document.getElementById("placePicker");
  el.innerHTML = `
    <div class="picker-panel">
      <h3 class="picker-panel_title"></h3>
      <div class="picker-group grid" data-group="room"></div>
      <div class="picker-group grid" data-group="area"></div>
      <div class="picker-group grid" data-group="table"></div>
    </div>
  `;
}

/* ---------- OPEN ---------- */
function getMode() {
const ctx = getContext();
  const anchor = ctx?.anchor;
  const mode = anchor?.type || "table";
  PLACE_RULES[mode].forEach(type => {
    if (!mode.includes(type)) {
      return;
    }
  });
  return type;
}

export function openPicker() {
  initPlacePicker();

  const type = getMode();
  
    // ROOM: chỉ hiển thị phòng của chính user
    if (type === "room" && anchor?.type === "room") {
      renderGroup("room", { [anchor.id]: anchor }, true);
      return;
    }

    renderGroup(type, PLACES[type]);

  document.querySelector(".picker-panel_title").textContent =
    translate("select_place");

  showOverlay("placePicker");
}

/* ---------- RENDER ---------- */

function renderGroup(type, data, isAnchorRoom = false) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  const title = getGroupTitle(type, isAnchorRoom);

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${getIcon(type)}</span>
      <span class="picker-title">${title}</span>
    </div>

    <div class="picker-list">
      ${Object.entries(data).map(([id, p]) => `
        <button class="picker-option btn center"
          data-type="${type}"
          data-id="${id}">
          ${translate(p.label)}
        </button>
      `).join("")}
    </div>
  `;

  group.querySelectorAll(".picker-option").forEach(btn => {
    btn.onclick = () => {
      applyPlaceById(btn.dataset.id);
      closeOverlay();
    };
  });
}

/* ---------- TITLE ---------- */

function getGroupTitle(type, isAnchorRoom) {
  if (type === "room" && isAnchorRoom) {
    return translate("my_room"); // nên thêm key này
  }

  if (type === "area") return translate("area");
  if (type === "table") return translate("table");

  return type;
}

/* ---------- CLEAR ---------- */

function clearGroup(type) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (group) group.innerHTML = "";
}