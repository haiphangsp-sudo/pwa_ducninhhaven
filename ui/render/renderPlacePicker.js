import { translate } from "../utils/translate.js";
import { PLACES } from "../../core/placesStore.js"; 
import { getPlaceIcon } from "../../data/helpers.js";

/**
 * Render bộ chọn vị trí theo nhóm (Room, Area, Table)
 */
export function renderPlacePicker(state, lastState) {
    const el = document.getElementById("placePicker");
    if (!el) return;

    // 1. Kiểm tra trạng thái đóng/mở (Diffing)
    const isOpening = state.view.overlay === 'placePicker' && lastState.overlay !== 'placePicker';
    const isClosing = state.view.overlay !== 'placePicker' && lastState.overlay === 'placePicker';

    if (isOpening) {
        // 2. Tạo nội dung HTML phân theo nhóm giống bản cũ
        const currentLang = state.lang.current;
        
        // Duyệt qua từng nhóm trong PLACES (room, area, table)
        const groupsHtml = Object.entries(PLACES).map(([type, items]) => {
            const entries = Object.entries(items);
            if (entries.length === 0) return ""; // Nhóm trống thì bỏ qua

            return `
                <div class="picker-group mb-l" data-group="${type}">
                    <div class="flex gap-s items-center mb-s opacity-70">
                        <span class="${type}-icon text-xl">${getPlaceIcon(type)}</span>
                        <span class="picker-title text-s text-bold text-uppercase">
                            ${translate(`place.my_${type}`)}
                        </span>
                    </div>

                    <div class="picker-grid grid gap-m">
                        ${entries.map(([id, data]) => `
                            <button class="btn-option p-m radius-m border stack items-center transition-all" 
                                    data-action="select-place" 
                                    data-value="${id}">
                                <span class="text-s text-bold">
                                    ${data.label?.[currentLang] || id}
                                </span>
                            </button>
                        `).join("")}
                    </div>
                </div>
            `;
        }).join("");

        // 3. Đổ vào container chính
        el.innerHTML = `
            <div class="picker-panel p-m radius-xl bg-white shadow-lg animate-fade-in">
                <div class="picker-header mb-m row justify-between items-center">
                    <h3 class="text-bold">${translate('place.select')}</h3>
                    <button data-action="close-overlay" class="btn-close">✕</button>
                </div>
                <div class="picker-content">
                    ${groupsHtml}
                </div>
            </div>
        `;
        
        el.classList.remove("hidden");
        console.log("Haven UI: Đã mở PlacePicker phân nhóm.");
    }

    if (isClosing) {
        el.classList.add("hidden");
    }
}