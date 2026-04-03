// ui/render/renderPlacePicker.js

import { getContext } from "../../core/context.js";
import { getAllowedPlaceTypes, getPlaceGroup, getPlaceItems } from "../../core/placeQuery.js"
import { translate } from "../utils/translate.js";


let shellReady = false;

export function renderPlacePicker() {
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
  const active = ctx?.active;

  const ruleType = anchor?.type || "table";
  const allowedTypes = getAllowedPlaceTypes(ruleType);

  updatePickerTitle();

  ["room", "area", "table"].forEach(type => {
    if (!allowedTypes.includes(type)) {
      clearGroup(type);
      return;
    }

    if (type === "room" && anchor?.type === "room") {
      renderGroup(type, [anchor], active);
      return;
    }

    renderGroup(type, getPlaceItems(type), active);
  });
}

function updatePickerTitle() {
  const titleEl = document.querySelector(".picker-panel_title");
  if (!titleEl) return;
  titleEl.textContent = translate("place.select");
}

function renderGroup(type, items, active) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  if (!items?.length) {
    group.innerHTML = "";
    return;
  }

  const meta = getPlaceGroup(type)?.meta || {};
  const title = meta.label ? translate(meta.label) : type;
  const icon = meta.icon || "";

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${icon}</span>
      <span class="picker-title">${title}</span>
    </div>

    <div class="picker-list">
      ${items.map(place => {
        const isActive = active?.id === place.id;

        return `
          <button
            class="picker-option btn center ${isActive ? "is-active" : ""}"
            type="button"
            data-action="select-place"
            data-option="${type}"
            data-value="${place.id}">
            ${translate(place.label)}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function clearGroup(type) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (group) group.innerHTML = "";
}
