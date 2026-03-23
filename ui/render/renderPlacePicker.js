import { translate } from "../utils/translate.js";
import { PLACES } from "../../core/placesStore.js"; 

export function renderPlacePicker(state, lastState) {
    const el = document.getElementById("placePicker");
    if (!el) return;

    // 1. Chỉ vẽ lại khi trạng thái overlay thay đổi (Diffing)
    const isOpening = state.view.overlay === 'placePicker' && lastState.overlay !== 'placePicker';
    const isClosing = state.view.overlay !== 'placePicker' && lastState.overlay === 'placePicker';

    if (isOpening) {
        // 2. Kỹ thuật "San phẳng" (Flattening) dữ liệu từ places.json
        // Chuyển từ { room: {...}, area: {...} } thành một danh sách các vị trí lẻ
        const allPlaces = Object.entries(PLACES).flatMap(([type, items]) => 
            Object.entries(items).map(([id, data]) => ({
                id: id,
                type: type,
                // Lấy đúng ngôn ngữ hiện tại từ State
                label: data.label?.[state.lang.current] || id,
                // Gán icon mặc định nếu trong json không có
                icon: data.icon || (type === 'room' ? '🚪' : type === 'area' ? '🌳' : '🪑')
            }))
        );

        el.innerHTML = `
            <div class="picker-panel p-m radius-xl bg-white shadow-lg animate-fade-in">
                <div class="picker-header mb-m row justify-between items-center border-b pb-s">
                    <h3 class="text-bold">${translate('place.select')}</h3>
                    <button data-action="close-overlay" class="btn-close">✕</button>
                </div>
                
                <div class="picker-grid grid gap-m">
                    ${allPlaces.map(place => `
                        <button class="btn-option p-m radius-m border stack items-center transition-all" 
                                data-action="select-place" 
                                data-value="${place.id}">
                            <span class="text-2xl mb-xs">${place.icon}</span>
                            <span class="text-s text-bold text-uppercase">${place.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        el.classList.remove("hidden");
    }

    if (isClosing) {
        el.classList.add("hidden");
    }
}