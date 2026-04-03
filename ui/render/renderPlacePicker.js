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
 * Hàm này hiện tại cực kỳ gọn vì không còn chứa logic if/else phức tạp
 */
function renderPlacePickerContent() {
  // 1. Lấy dữ liệu đã được "gọt giũa" sẵn từ Selector
  const pickerGroups = getPickerGroups(); 

  // 2. Luôn xóa sạch nội dung cũ để đảm bảo Render sạch sẽ
  ["room", "area", "table"].forEach(clearGroup);

  // 3. Cập nhật tiêu đề
  const titleEl = document.querySelector(".picker-panel_title");
  if (titleEl) titleEl.textContent = translate("place.select");

  // 4. Duyệt qua mảng groups đã được lọc và vẽ
  pickerGroups.forEach(groupData => {
    renderGroup(groupData);
  });
}

/**
 * renderGroup bây giờ nhận object chuẩn từ getPickerGroups
 * { type, title, icon, items: [{id, label, isActive}] }
 */
function renderGroup(groupData) {
  const { type, title, icon, items } = groupData;
  const groupElement = document.querySelector(`[data-group="${type}"]`);
  if (!groupElement) return;

  groupElement.innerHTML = `
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