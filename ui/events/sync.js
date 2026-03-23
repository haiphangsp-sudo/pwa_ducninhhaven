// ui/sync.js hoặc main.js
import { subscribe } from '../../core/state.js';
import { renderStatusBar } from '../../ui/render/renderStatusBar.js';
import { renderDrawer } from '../../ui/render/renderDrawer.js';
import { renderCartBar } from '../../ui/render/renderCart.js';
import { renderNavBar } from '../../ui/components/navBar.js';
import { renderPanel } from '../../ui/render/renderPanel.js';
import { renderHub } from '../../ui/render/renderHub.js';
import { showOverlay } from '../../ui/interactions/backdropManager.js';
import { renderPlacePicker } from '../../ui/render/renderPlacePicker.js';


export function initUISync() {
    renderNavBar();
    renderHub();
    subscribe(renderApp);
  // Lắng nghe mọi sự thay đổi của State
  subscribe((state) => {
    console.log("State changed, syncing UI...", state);

    // 1. Tự động vẽ lại thanh trạng thái đơn hàng
    renderStatusBar();

    // 2. Tự động vẽ lại giỏ hàng (nếu đang mở)
    if (state.view.panel === "cart") {
        renderDrawer();
    }

    // 3. Cập nhật thanh Cart Bar (tổng tiền, số lượng)
    renderCartBar();
    
    // 4. Các thành phần khác (Delivery, Recovery...)
    // renderDeliveryBanner(state.delivery);
  });

}

function renderApp(state) {

// Lưu trữ các giá trị của lần render cuối cùng
// Bộ nhớ đệm để so sánh sự thay đổi (Diffing)
let lastState = {
    panel: null,
    lang: null,
    placeId: null,
    errorActive: null,
    overlay: null
};


    // 1. Diffing Ngôn ngữ: Chỉ cập nhật thuộc tính lang của HTML khi đổi ngôn ngữ
    if (state.lang.current !== lastState.lang) {
        document.documentElement.lang = state.lang.current;
        lastState.lang = state.lang.current;
        console.log("UI Diff: Language updated");
    }

    // 2. Diffing Panel: Chỉ đóng/mở các màn hình lớn khi panel thay đổi
    if (state.view.panel !== lastState.panel) {
        lastState.panel = state.view.panel;
        console.log(`UI Diff: Panel switched to ${state.view.panel}`);
        renderPanel(lastState.panel);
    }

    // 3. Diffing Bối cảnh (Identity): Chỉ cập nhật tên phòng khi có thay đổi
    const currentPlaceId = state.context.active?.id || "Duc Ninh Haven";
    if (currentPlaceId !== lastState.placeId) {
        const placeLabel = document.querySelector('.identity-label');
        if (placeLabel) {
            placeLabel.textContent = currentPlaceId;
        }
        lastState.placeId = currentPlaceId;
        console.log(`UI Diff: Identity updated to ${currentPlaceId}`);
        renderNavBar();
    }

    if (lastState.overlay !== state.view.overlay) {
        lastState.overlay = state.view.overlay;
        syncPlacePickerUI(state, lastState);
        console.log(`UI Diff: Overlay updated to ${state.view.overlay}`);
        showOverlay(lastState.overlay);
    }


    // 4. Diffing Lỗi hệ thống: Chỉ can thiệp vào DOM khi trạng thái lỗi thay đổi
    if (state.error.active !== lastState.errorActive) {
        const errorEl = document.getElementById('globalError');
        if (errorEl) {
            errorEl.classList.toggle('hidden', !state.error.active);
            if (state.error.active) {
                errorEl.textContent = state.error.message;
            }
        }
        lastState.errorActive = state.error.active;
        console.log("UI Diff: Error state toggled");
    }
    
}