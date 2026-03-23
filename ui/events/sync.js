// ui/events/sync.js
import { renderStatusBar } from '../../ui/render/renderStatusBar.js';
import { renderDrawer } from '../../ui/render/renderDrawer.js';
import { renderCartBar } from '../../ui/render/renderCart.js';
import { renderNavBar } from '../../ui/components/navBar.js';
import { renderHub } from '../../ui/render/renderHub.js';
import { showOverlay } from '../../ui/interactions/backdropManager.js';
import { renderPlacePicker } from '../../ui/render/renderPlacePicker.js';
import { subscribe, getState } from '../../core/state.js';

// KHỞI TẠO BỘ NHỚ ĐỆM (Nằm ngoài hàm để không bị reset)
let lastState = {
    view: { panel: null, overlay: null },
    lang: { current: null },
    context: { active: { id: null } }
};

export function initUISync() {
    // 1. Vẽ lần đầu khi vừa mở App
    syncUI(getState());

    // 2. Đăng ký theo dõi State: Mỗi khi State đổi, gọi syncUI
    subscribe((state) => {
        syncUI(state);
    });
}

function syncUI(state) {
    // --- KIỂM TRA OVERLAY (PlacePicker) ---
    // Chỉ vẽ lại nếu trạng thái overlay thay đổi (null <-> placePicker)
    if (state.view.overlay !== lastState.view.overlay) {
        renderPlacePicker(state, lastState);
        
        // Điều khiển Backdrop toàn cục
        const backdrop = document.getElementById('overlayBackdrop');
        if (backdrop) {
            backdrop.classList.toggle('hidden', !state.view.overlay);
        }
    }

    // --- KIỂM TRA VỊ TRÍ (Identity) ---
    // Nếu khách chọn phòng mới (Olive -> Juniper), cập nhật NavBar
    if (state.context.active?.id !== lastState.context.active?.id) {
        renderNavBar(); // Cập nhật tên phòng trên thanh điều hướng
    }

    // --- KIỂM TRA PANEL (Chuyển trang) ---
    if (state.view.panel !== lastState.view.panel) {
        // Logic ẩn hiện các ngăn panel-intro, panel-food...
        console.log(`UI: Chuyển màn hình sang ${state.view.panel}`);
    }

    // QUAN TRỌNG: Cập nhật lại bộ nhớ đệm sau khi đã so sánh xong
    lastState = JSON.parse(JSON.stringify(state));
}