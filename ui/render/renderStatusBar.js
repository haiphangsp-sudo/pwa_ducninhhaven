
// ui/render/renderStatusBar.js
import { translate } from '../utils/translate.js';
import { renderStepper } from './renderStepper.js';

// ui/render/renderStatusBar.js
export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    if (!bar) return;

    // 1. Đồng bộ trạng thái Thu nhỏ/Mở rộng
    const { isBarExpanded } = state.orders;
    if (isBarExpanded) {
        bar.classList.remove("is-collapsed");
    } else {
        bar.classList.add("is-collapsed");
    }

    // 2. Logic hiển thị nội dung đơn hàng (active orders)
    const activeOrders = state.orders.active || [];
    const countEl = document.getElementById("orderActiveCount");
    const textEl = document.getElementById("orderStatusText");

    if (activeOrders.length > 0) {
        // Nếu có đơn hàng đang xử lý
        countEl.textContent = activeOrders.length;
        // Lấy trạng thái của đơn hàng mới nhất để hiện Stepper
        const latestStatus = activeOrders[0].status; 
        // ... renderStepper(latestStatus) ...
    } else {
        // Nếu không có đơn, hiện thông tin giỏ hàng như cũ
        const cartQty = state.cart.items.reduce((s, i) => s + i.qty, 0);
        countEl.textContent = cartQty;
        textEl.textContent = `🛒 Giỏ hàng có ${cartQty} món`;
    }
}
export function statutBarEvent() {
    
    const statusBar = document.getElementById('orderStatusBar');
    const btnToggle = document.getElementById('btnToggleBar');

    btnToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        statusBar.classList.toggle('is-collapsed');
    });

    // Nếu muốn bấm vào cái "chấm" xanh khi đã thu nhỏ để mở ra
    statusBar?.addEventListener('click', () => {
        if (statusBar.classList.contains('is-collapsed')) {
            statusBar.classList.remove('is-collapsed');
        }
    });
}