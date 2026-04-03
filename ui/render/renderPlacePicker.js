// ui/render/renderPlacePicker.js

import { getContext } from "../../core/context.js";
import { getAllowedPlaceTypes, getPlaceGroup, getPlaceItems } from "../../core/placesStore.js";
import { translate } from "../utils/translate.js";
import { getState } from "../../core/state.js";


let shellReady = false;

export function renderPlacePickerCu() {
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

function getPlacesData() {
  return getState().menu?.data || {};
}

export function renderPlacePicker(state) {
    const el = document.getElementById("placePicker");
    if (!el || state.view.overlay !== 'placePicker') return;

    const anchor = state.context.anchor; // Vị trí gốc từ URL (vd: {id: "cloud", type: "room"})
    const lang = state.lang.current;
    const PLACES = getPlacesData();

    // 1. Lấy danh sách các loại (Type) mà vị trí gốc của khách được phép nhìn thấy
    // Ví dụ: Nếu khách ở 'area', PLACES['area'].meta.allow sẽ là ['area', 'table']
    const anchorCategory = PLACES[anchor?.type];
    const allowedTypes = anchorCategory?.meta?.allow || ["table"];

    el.innerHTML = `
        <div class="picker-panel p-m radius-xl bg-white shadow-lg animate-fade-in">
            <div class="picker-header mb-m row justify-between items-center">
                <h3 class="text-bold">${translate('place.select_title') || 'Where would you like to serve?'}</h3>
                <button data-action="close-overlay" class="btn-close">✕</button>
            </div>
            
            <div class="picker-content stack gap-l">
                ${Object.entries(PLACES).map(([groupKey, group]) => {
                    // 2. KIỂM TRA QUYỀN TRUY CẬP
                    // Chỉ hiển thị nhóm nếu groupKey (room/area/table) nằm trong danh sách allowedTypes
                    if (!allowedTypes.includes(groupKey)) return '';

                    // 3. LOGIC LỌC PHÒNG (Privacy): 
                    // Nếu là nhóm 'room', chỉ hiện đúng cái phòng mà khách đang ở (anchor.id)
                    const filteredItems = group.items.filter(item => 
                        groupKey === 'room' ? item.id === anchor?.id : true
                    );

                    if (filteredItems.length === 0) return '';

                    return `
                        <div class="place-group">
                            <div class="group-header row items-center gap-s mb-s">
                                <span class="group-icon">${group.meta.icon}</span>
                                <span class="text-bold text-s">${group.meta.label[lang]}</span>
                            </div>
                            <div class="group-grid row wrap gap-s">
                                ${filteredItems.map(item => `
                                    <button class="btn-place p-m radius-m bg-green-dark text-white text-bold transition-all" 
                                            data-action="select-place" 
                                            data-value="${item.id}">
                                        ${item.label[lang] || item.id}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    el.classList.remove("hidden");
}