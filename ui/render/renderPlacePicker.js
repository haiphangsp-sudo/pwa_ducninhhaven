
import { translate } from "../utils/translate.js";
import { PLACES } from "../../core/placesStore.js"; 

/**
 * Render bộ chọn vị trí (Place Picker) cho Đức Ninh Haven.
 * @param {Object} state - Trạng thái hiện tại từ Store.
 * @param {Object} lastState - Trạng thái cũ để thực hiện Diffing.
 */
export function renderPlacePicker(state, lastState) {
    const el = document.getElementById("placePicker");
    if (!el) return;

    // 1. Lấy giá trị overlay từ State
    const currentOverlay = state.view.overlay;
    const previousOverlay = lastState.overlay; // lastState được quản lý từ sync.js

    // 2. Kiểm tra trạng thái Thay đổi (Diffing)
    const isOpening = currentOverlay === 'placePicker' && previousOverlay !== 'placePicker';
    const isClosing = currentOverlay !== 'placePicker' && previousOverlay === 'placePicker';

    // 3. Xử lý khi MỞ: Vẽ toàn bộ HTML và hiển thị
    if (isOpening) {
        el.innerHTML = `
            <div class="picker-panel p-m radius-xl bg-white shadow-lg animate-fade-in">
                <div class="picker-header mb-m row justify-between items-center border-b pb-s">
                    <h3 class="text-bold text-dark">${translate('place.select')}</h3>
                    <button data-action="close-overlay" class="btn-close p-s" aria-label="Close">✕</button>
                </div>
                
                <div class="picker-grid grid gap-m">
                    ${Object.entries(PLACES).map(([id, place]) => `
                        <button class="btn-option p-m radius-m border stack items-center transition-all hover-scale" 
                                data-action="select-place" 
                                data-value="${id}">
                            <span class="text-2xl mb-xs">${place.icon || '📍'}</span>
                            <span class="text-s text-bold text-uppercase">${id}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        el.classList.remove("hidden");
        console.log("Haven UI: PlacePicker đã được mở.");
    }

    // 4. Xử lý khi ĐÓNG: Chỉ ẩn đi, không cần xóa HTML
    if (isClosing) {
        el.classList.add("hidden");
        console.log("Haven UI: PlacePicker đã đóng.");
    }
}