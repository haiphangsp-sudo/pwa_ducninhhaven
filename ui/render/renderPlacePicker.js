import { translate } from "../utils/translate.js";
import { PLACES, getAllowedPlaceTypes } from "../../core/placesStore.js"; 

export function renderPlacePicker(state, lastState) {
    const el = document.getElementById("placePicker");
    if (!el) return;

    // Chỉ thực hiện render nếu overlay đang mở
    if (state.view.overlay !== 'placePicker') {
        el.classList.add("hidden");
        return;
    }

    const anchor = state.context.anchor;
    const allowedGroups = getAllowedPlaceTypes(anchor?.type); // Lấy quyền hiển thị từ places.json

    const groupMeta = {
        room: { icon: '🛏️', label: 'My room' },
        area: { icon: '🌿', label: 'My area' },
        table: { icon: '☕', label: 'My table' }
    };

    el.innerHTML = `
        <div class="picker-panel p-m radius-xl bg-white shadow-lg animate-fade-in">
            <div class="picker-header mb-m row justify-between items-center">
                <h3 class="text-bold">Where would you like to serve?</h3>
                <button data-action="close-overlay" class="btn-close">✕</button>
            </div>
            
            <div class="picker-content stack gap-l">
                ${allowedGroups.map(groupType => {
                    const items = PLACES[groupType] || {};
                    const meta = groupMeta[groupType];

                    // Logic lọc: Nếu là room, chỉ hiện phòng đang ở (anchor.id)
                    const filteredEntries = Object.entries(items).filter(([id]) => 
                        groupType === 'room' ? id === anchor?.id : true
                    );

                    if (filteredEntries.length === 0) return '';

                    return `
                        <div class="place-group">
                            <div class="group-header row items-center gap-s mb-s">
                                <span class="text-bold text-s">${meta.label}</span>
                            </div>
                            <div class="group-grid row wrap gap-s">
                                ${filteredEntries.map(([id, data]) => `
                                    <button class="btn-place p-m radius-m bg-green-dark text-white text-bold" 
                                            data-action="select-place" 
                                            data-value="${id}">
                                        ${data.label?.[state.lang.current] || id}
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