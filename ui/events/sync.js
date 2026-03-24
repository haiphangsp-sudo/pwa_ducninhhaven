// ui/events/sync.js
import { renderStatusBar } from '../../ui/render/renderStatusBar.js';
import { renderDrawer } from '../../ui/render/renderDrawer.js';
import { renderCartBar } from '../../ui/render/renderCart.js';
import { renderNavBar } from '../../ui/components/navBar.js';
import { showOverlay } from '../../ui/interactions/backdropManager.js';
import { renderPlacePicker } from '../../ui/render/renderPlacePicker.js';
import { subscribe, getState } from '../../core/state.js';
import { renderPanel } from '../../ui/render/renderPanel.js';
import { renderHub } from '../../ui/render/renderHub.js';


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
    const pickerNav = document.getElementById('pickerNav');
    const overlay = state.view.overlay;
    if (overlay !== lastState.view.overlay) {
        
        if (overlay === 'placePicker') {
            renderPlacePicker();
           

        } else if(overlay === 'new'){

        }
         showOverlay(overlay);
        // Điều khiển Backdrop toàn cục
             
    }
    const lang = state.lang.current;
     const panel = state.view.panel;
    if (lang !== lastState.lang.current){
        const langSwitch = document.getElementById("langSwitch");
        if(langSwitch){
            langSwitch.querySelectorAll("button").forEach(btn => {
                // "Join" class: Nếu data-value khớp với State thì thêm, không thì xóa
                const isActive = btn.dataset.value === lang;
                btn.classList.toggle("is-active", isActive);
                localStorage.setItem("haven_lang", lang);
                renderNavBar();
                renderCartBar();
                renderStatusBar();
                renderHub();
                renderPanel(panel);
            });
            
        }
    }
    // --- KIỂM TRA VỊ TRÍ (Identity) ---
    // Nếu khách chọn phòng mới (Olive -> Juniper), cập nhật NavBar
    if (state.context.active?.id !== lastState.context.active?.id) {
        renderNavBar(); // Cập nhật tên phòng trên thanh điều hướng
    }

    // --- KIỂM TRA PANEL (Chuyển trang) ---
    if (state.view.panel !== lastState.view.panel) {
       
        
        const navMenu = document.getElementById('hubMenu');
        if (navMenu) { 
            navMenu.querySelectorAll(`[data-value]`).forEach((item) => {
                item.classList.remove("is-active");
            });
            navMenu.querySelector(`[data-value="${panel}"]`)?.classList.add("is-active");
            renderPanel(panel);
        }
        
    }

    // QUAN TRỌNG: Cập nhật lại bộ nhớ đệm sau khi đã so sánh xong
    lastState = JSON.parse(JSON.stringify(state));
}
