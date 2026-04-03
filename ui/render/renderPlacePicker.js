import { getPickerGroups } from "../../core/placeQuery.js";
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
  const groups = getPickerGroups();

  updatePickerTitle();

  ["room", "area", "table"].forEach(type => {
    const groupData = groups.find(group => group.type === type);

    if (!groupData) {
      clearGroup(type);
      return;
    }

    renderGroup(type, groupData);
  });
}

function updatePickerTitle() {
  const titleEl = document.querySelector(".picker-panel_title");
  if (!titleEl) return;

  titleEl.textContent = translate("place.select");
}

function renderGroup(type, groupData) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  const items = groupData?.items || [];
  if (!items.length) {
    group.innerHTML = "";
    return;
  }

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${groupData.icon || ""}</span>
      <span class="picker-title">${groupData.title || type}</span>
    </div>

    <div class="picker-list">
      ${items.map(place => `
        <button
          class="picker-option btn center ${place.isActive ? "is-active" : ""}"
          type="button"
          data-action="select-place"
          data-option="${type}"
          data-value="${place.id}">
          ${place.label}
        </button>
      `).join("")}
    </div>
  `;
}

function clearGroup(type) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  group.innerHTML = "";
}