

// ui/render/renderStatusBar.js
import { translate } from '../utils/translate.js';
import { renderStepper } from './renderStepper.js';

export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    const countEl = document.getElementById("orderActiveCount");
    const textEl = document.getElementById("orderStatusText");
    const btnCheck = document.getElementById("btnCheckOrders");
    const btnToggle = document.getElementById('btnToggleBar');

    btnToggle.dataset.action = "toggle_status";
    btnCheck.dataset.action = "check_orders";

    if (!bar || !textEl || !countEl) return;

    const { active, isBarExpanded } = state.orders;
    const cartItems = state.cart?.items || [];
    const totalCartQty = cartItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);

    // 1. QUẢN LÝ ĐÓNG/MỞ (is-collapsed)
    bar.classList.toggle("is-collapsed", !isBarExpanded);

    // 2. CHỐT CHẶN HIỂN THỊ (Ẩn toàn bộ nếu không có gì)
    if (active.length === 0 && totalCartQty === 0) {
        bar.classList.add("hidden");
        return;
    }
    bar.classList.remove("hidden");

    // 3. LOGIC NỘI DUNG (Ưu tiên Đơn hàng > Giỏ hàng)
    if (active.length > 0) {
        // TRƯỜNG HỢP: Đang có đơn hàng (Hiển thị Stepper)
        const latestOrder = active[active.length - 1]; // Lấy đơn mới nhất
        countEl.textContent = active.length; // Số lượng đơn đang chạy
        textEl.innerHTML = renderStepper(latestOrder.status);
        bar.className = `status-bar is-${latestOrder.status} ${!isBarExpanded ? 'is-collapsed' : ''}`;
    } 
    else {
        // TRƯỜNG HỢP: Chỉ có giỏ hàng
        countEl.textContent = totalCartQty;
        const locationName = state.context?.active?.name || "";
        textEl.textContent = locationName 
            ? `${locationName} • ${totalCartQty} món`
            : `🛒 Giỏ hàng có ${totalCartQty} món`;
        bar.className = `status-bar is-idle ${!isBarExpanded ? 'is-collapsed' : ''}`;
    }
}
