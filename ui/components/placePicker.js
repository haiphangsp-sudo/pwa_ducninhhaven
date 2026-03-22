// ui/components/placePicker.js

import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { PLACES, getAllowedPlaceTypes } from "../../core/placesStore.js";
import { getContext, applyPlaceById } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { getPlaceIcon } from "../../data/helpers.js";

let shellReady = false;

/* =========================
   PUBLIC
========================= */

export function openPicker() {
  
  renderPlacePicker();
  showOverlay("placePicker");
}

export function renderPlacePicker() {
  renderPlacePickerShell();
  renderPlacePickerContent();
}

/* =========================
   SHELL
========================= */

function renderPlacePickerShell() {
  if (shellReady) return;

  const el = document.getElementById("placePicker");
  if (!el) return;

  el.innerHTML = `
    <div class="picker-panel">
      <h3 class="picker-panel_title"></h3>
      <div class="picker-group grid" data-group="room"></div>
      <div class="picker-group grid" data-group="area"></div>
      <div class="picker-group grid" data-group="table"></div>
    </div>
  `;

  shellReady = true;
}

/* =========================
   CONTENT
========================= */

function renderPlacePickerContent() {
  const ctx = getContext();
  const anchor = ctx?.anchor;
  const mode = anchor?.type || "table";
  const allowedTypes = getAllowedPlaceTypes(mode);

  updatePickerTitle();

  ["room", "area", "table"].forEach(type => {
    if (!allowedTypes.includes(type)) {
      clearGroup(type);
      return;
    }

    if (type === "room" && anchor?.type === "room") {
      renderGroup("room", { [anchor.id]: anchor }, true);
      return;
    }

    renderGroup(type, PLACES[type]);
  });
}

/* =========================
   UPDATE
========================= */

function updatePickerTitle() {
  const titleEl = document.querySelector(".picker-panel_title");
  if (!titleEl) return;

  titleEl.textContent = translate("place.select");
}

/* =========================
   GROUP
========================= */

function renderGroup(type, data, isAnchorRoom = false) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  const entries = Object.entries(data || {});
  if (!entries.length) {
    group.innerHTML = "";
    return;
  }

  const title = getGroupTitle(type, isAnchorRoom);

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${getPlaceIcon(type)}</span>
      <span class="picker-title">${title}</span>
    </div>

    <div class="picker-list">
      ${entries.map(([id, p]) => `
        <button
          class="picker-option btn center"
          type="button"
          data-id="${id}">
          ${translate(p.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function clearGroup(type) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (group) group.innerHTML = "";
}

function getGroupTitle(type, isAnchorRoom) {
  if (type === "room" && isAnchorRoom) return translate("place.my_room");
  if (type === "area") return translate("place.my_area");
  if (type === "table") return translate("place.my_table");
  return type;
}

/* =========================
   EVENTS
========================= */

export function attachPlacePickerEvents() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".picker-option");
    if (btn) {
      closeOverlay();
      applyPlaceById(btn.dataset.id);
    }
  });
}
