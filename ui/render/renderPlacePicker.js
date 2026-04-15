// ui/render/renderPlacePicker.js
import { getPickerGroups } from "../../core/placesQuery.js";
import { translate } from "../utils/translate.js";
import { getState } from "../../core/state.js";

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
  // 1. Lấy dữ liệu đã được lọc và chuẩn hóa sẵn
  const pickerGroups = getPickerGroups(); 

  // 2. Cập nhật tiêu đề
  const titleEl = document.querySelector(".picker-panel_title");
  if (titleEl) titleEl.textContent = translate("place.select");

  // 3. Luôn dọn sạch các group cũ trước khi vẽ mới
  ["room", "area", "table"].forEach(type => {
    const group = document.querySelector(`[data-group="${type}"]`);
    if (group) group.innerHTML = "";
  });

  // 4. Vẽ các group dựa trên kết quả trả về
  pickerGroups.forEach(groupData => {
    renderGroup(groupData);
  });
}

function renderGroup(groupData) {
  const { type, title, icon, items } = groupData;
  const container = document.querySelector(`[data-group="${type}"]`);
  if (!container || !items?.length) return;
  const source = getState().overlay?.source;
  
  container.innerHTML = `
    <div class="flex gap-s">
      <span class="${type}-icon">${icon}</span>
      <span class="picker-title">${title}</span>
    </div>
    <div class="picker-list">
      ${items.map(item => `
        <button
          class="picker-option btn center ${item.isActive ? "is-active" : ""}"
          type="button"
          data-action="select-place"
          data-option="${type}"
          data-value="${item.id}"
          data-extra="${source}">
          ${item.label}
        </button>
      `).join("")}
    </div>
  `;
}