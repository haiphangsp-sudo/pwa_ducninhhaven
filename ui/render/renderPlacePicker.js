import { translate } from "../utils/translate.js";
import { PLACES, getAllowedPlaceTypes } from "../../core/placesStore.js"; 

export function renderPlacePicker(state, lastState) {
    const el = document.getElementById("placePicker");
    if (!el) return;

    const isOpening = state.view.overlay === 'placePicker' && lastState.overlay !== 'placePicker';
    const isClosing = state.view.overlay !== 'placePicker' && lastState.overlay === 'placePicker';

    if (isOpening) {
        // 1. Xác định quyền hạn dựa trên Anchor (vị trí gốc từ URL)
        const anchor = state.context.anchor; 
        const anchorType = anchor?.type || "table"; // Mặc định là vãng lai (table)
        
        // Lấy danh sách các nhóm được phép (vd: ["room", "area", "table"])
        const allowedGroups = getAllowedPlaceTypes(anchorType); 

        // 2. Định nghĩa Icon và Tiêu đề cho từng nhóm
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

                        // 3. LOGIC LỌC QUAN TRỌNG:
                        const filteredEntries = Object.entries(items).filter(([id]) => {
                            // Nếu là loại 'room', chỉ hiện đúng phòng của khách (anchor.id)
                            if (groupType === 'room') return id === anchor?.id;
                            // Các loại khác hiện tất cả
                            return true;
                        });

                        if (filteredEntries.length === 0) return '';

                        return `
                            <div class="place-group">
                                <div class="group-header row items-center gap-s mb-s">
                                    <span>${meta.icon}</span>
                                    <span class="text-bold text-s">${meta.label}</span>
                                </div>
                                <div class="group-grid row wrap gap-s">
                                    ${filteredEntries.map(([id, data]) => `
                                        <button class="btn-place p-m radius-m bg-green-dark text-white text-bold transition-all" 
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

    if (isClosing) {
        el.classList.add("hidden");
    }
}