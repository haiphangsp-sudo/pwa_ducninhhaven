// ui/sync.js hoặc main.js
import { subscribe } from '../core/state.js';
import { renderStatusBar } from './render/renderStatusBar.js';
import { renderDrawer } from './render/renderDrawer.js';
import { renderCartBar } from './render/renderCart.js';

export function initUISync() {
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