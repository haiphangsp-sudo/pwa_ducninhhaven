// ui/components/placePicker.js

import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { getAllowedPlaceTypes, getPlaceGroup, getPlaceItems } from "../../core/placesStore.js";
import { getContext, applyPlaceById } from "../../core/context.js";
import { translate } from "../utils/translate.js";

let shellReady = false;

 export function openPicker() {
  renderPlacePicker();
  showOverlay("placePicker");
}

function renderPlacePicker() {
  renderPlacePickerShell();
  renderPlacePickerContent();
}

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
      renderGroup("room", [anchor], true);
      return;
    }

    renderGroup(type, getPlaceItems(type));
  });
}

function updatePickerTitle() {
  const titleEl = document.querySelector(".picker-panel_title");
  if (!titleEl) return;

  titleEl.textContent = translate("place.select");
}

function renderGroup(type, items, isAnchorRoom = false) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  if (!items?.length) {
    group.innerHTML = "";
    return;
  }

  const title = getGroupTitle(type, isAnchorRoom);
  const icon = getPlaceGroup(type)?.meta?.icon || "";

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${icon}</span>
      <span class="picker-title">${title}</span>
    </div>

    <div class="picker-list">
      ${items.map((p) => `
        <button
          data-action="select-place"
          data-value="${p.id}"
          class="picker-option btn center"
          type="button">
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
  const group = getPlaceGroup(type);
  if (!group) return type;

  if (type === "room" && isAnchorRoom) {
    return translate(group.meta.label);
  }

  return translate(group.meta.label);
}

export function attachPlacePickerEvents() {
  document.addEventListener("click", handlePlacePickerClick);
}

function handlePlacePickerClick(e) {
  const btn = e.target.closest(".picker-option");
  if (!btn) return;
  applyPlaceById(btn.dataset.value);
}