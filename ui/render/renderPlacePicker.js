// ui/render/renderPlacePicker.js

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

/**
 * Hàm này bây giờ cực kỳ gọn vì logic đã nằm hết trong getPickerGroups()
 */
function renderPlacePickerContent() {
  // 1. Lấy dữ liệu đã được tính toán và dịch sẵn
  const pickerGroups = getPickerGroups();
  
  // 2. Cập nhật tiêu đề chính
  const titleEl = document.querySelector(".picker-panel_title");
  if (titleEl) titleEl.textContent = translate("place.select");

  // 3. Xóa sạch các group cũ trước khi vẽ mới (phòng trường hợp allowedTypes thay đổi)
  ["room", "area", "table"].forEach(clearGroup);

  // 4. Vẽ từng group dựa trên dữ liệu trả về
  pickerGroups.forEach(groupData => {
    renderGroup(groupData);
  });
}

/**
 * Nhận object groupData từ getPickerGroups()
 * { type, title, icon, items: [{id, label, isActive}] }
 */
function renderGroup(groupData) {
  const { type, title, icon, items } = groupData;
  const groupEl = document.querySelector(`[data-group="${type}"]`);
  if (!groupEl) return;

  groupEl.innerHTML = `
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
          data-value="${item.id}">
          ${item.label}
        </button>
      `).join("")}
    </div>
  `;
}

function clearGroup(type) {
  const group = document.querySelector(`[data-group="${type}"]`);
  if (group) group.innerHTML = "";
}