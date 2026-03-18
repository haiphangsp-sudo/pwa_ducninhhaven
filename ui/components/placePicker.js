
// ui/components/placePicker.js

import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { getIcon } from "./navBar.js";
import { PLACES, PLACE_RULES } from "../../data/places.js";
import { getContext, resolvePlace, setActive } from "../../core/context.js";
import { translate } from "../utils/translate.js";

/* -------------------------------------------------- */

const PLACE_ORDER = ["room", "area", "table"];

function initPlacePicker() {
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
}

/* -------------------------------------------------- */

export function openPicker() {
  initPlacePicker();

  const ctx = getContext();
  const anchorType = ctx?.anchor?.type || "table";
  const allowedTypes = PLACE_RULES[anchorType] || ["table"];

  document.querySelector(".picker-panel_title").textContent = translate("select_place");

  PLACE_ORDER.forEach(type => {
    if (allowedTypes.includes(type)) {
      renderGroup(type, PLACES[type]);
    } else {
      clearGroup(type);
    }
  });

  showOverlay("placePicker");
}

/* -------------------------------------------------- */

function renderGroup(type, data) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  const entries = Object.entries(data || {});
  if (!entries.length) {
    group.innerHTML = "";
    return;
  }

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${getIcon(type)}</span>
      <span class="picker-title">${translate(type)}</span>
    </div>
    <div class="picker-list">
      ${entries.map(([id, place]) => `
        <button class="picker-option btn center" data-id="${id}">
          ${translate(place.label)}
        </button>
      `).join("")}
    </div>
  `;

  group.querySelectorAll(".picker-option").forEach(btn => {
    btn.onclick = () => {
      const resolved = resolvePlace(btn.dataset.id);
      if (!resolved) return;

      setActive(resolved);
      closeOverlay();
    };
  });
}

/* -------------------------------------------------- */

function clearGroup(type) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (group) group.innerHTML = "";
}

/* -------------------------------------------------- */