// ui/render/renderPlacePicker.js
import { translate } from "../utils/translate.js";
import { PLACES } from "../../core/placesStore.js"; 

export function renderPlacePicker(state, lastState) {
    const el = document.getElementById("placePicker");
    if (!el) return;

    // 1. DIFFING: Chỉ vẽ lại nội dung nếu overlay vừa được mở
    const isOpening = state.view.overlay === 'placePicker' && lastState.overlay !== 'placePicker';
    const isClosing = state.view.overlay !== 'placePicker' && lastState.overlay === 'placePicker';

    if (isOpening) {
        // Vẽ toàn bộ HTML vào Container
        el.innerHTML = `
            <div class="picker-panel p-m radius-xl bg-white shadow-lg">
                <div class="picker-header mb-m row justify-between">
                    <h3>${translate('place.select')}</h3>
                    <button onclick="Haven.closePicker()" class="btn-close">✕</button>
                </div>
                
                <div class="picker-grid grid gap-m">
                    ${Object.entries(PLACES).map(([id, place]) => `
                        <button class="btn-option p-m radius-m border stack items-center" 
                                onclick="Haven.selectPlace('${id}')">
                            <span class="text-xl">${place.icon || '📍'}</span>
                            <span class="text-s text-bold">${id}</span>
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