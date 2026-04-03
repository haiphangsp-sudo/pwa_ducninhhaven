// ui/render/renderPlacePicker.js

import { getPickerGroups } from "../../core/placeQuery.js";


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



export function renderPlacePicker() {
  const groups = getPickerGroups();

  updatePickerTitle();

  ["room", "area", "table"].forEach(type => {
    const groupData = groups.find(g => g.type === type);

    if (!groupData) {
      clearGroup(type);
      return;
    }

    renderGroup(type, groupData);
  });
}

function renderGroup(type, groupData) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (!group) return;

  group.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${groupData.icon}</span>
      <span class="picker-title">${groupData.title}</span>
    </div>

    <div class="picker-list">
      ${groupData.items.map(place => `
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