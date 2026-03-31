// ui/render/renderStatusBar.js
import { translate } from '../utils/translate.js';
import { renderStepper } from './renderStepper.js';

export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    const countEl = document.getElementById("orderActiveCount");
    const textEl = document.getElementById("orderStatusText");
    const btnCheck = document.getElementById("btnCheckOrders");
    
    if (!bar || !textEl || !countEl) return;

    const { status, msg } = state.order;
    const totalQty = (state.cart?.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);

    // 1. CHỐT CHẶN HIỂN THỊ: Ẩn nếu không có đơn và không có giỏ
    if (status === "idle" && totalQty === 0) {
        bar.classList.add("hidden");
        return;
    }

    // 2. HIỆN THANH BAR & CẬP NHẬT CLASS TRẠNG THÁI
    bar.classList.remove("hidden");
    // Xóa các class cũ và thêm class mới: is-idle, is-pending, is-COOKING...
    bar.className = `status-bar is-${status}`;

    // 3. CẬP NHẬT PHẦN MINI (Con số thông báo)
    // Nếu đang có đơn thực tế (NEW, COOKING...), số này là số đơn. 
    // Nếu đang ở giỏ hàng, số này là tổng số món.
    countEl.textContent = totalQty;

    // 4. CẬP NHẬT PHẦN EXPANDED (Nội dung chi tiết)
    const trackingStatuses = ['NEW', 'COOKING', 'DELIVERING', 'DONE'];

    if (trackingStatuses.includes(status)) {
        // A. Nếu đang theo dõi đơn hàng -> Vẽ Stepper vào
        textEl.innerHTML = renderStepper(status);
        if (btnCheck) btnCheck.style.display = "block"; // Hiện nút kiểm tra chi tiết
    } 
    else if (status === "pending") {
        // B. Nếu đang gửi đơn
        textEl.innerHTML = `<span class="loading-dots">${translate('cart_bar.sending')}</span>`;
        if (btnCheck) btnCheck.style.display = "none";
    }
    else {
        // C. Nếu đang idle (Chỉ có giỏ hàng)
        const locationName = state.context.active?.name || "";
        textEl.textContent = locationName 
            ? `${locationName} • ${totalQty} món`
            : `🛒 Giỏ hàng có ${totalQty} món`;
        if (btnCheck) btnCheck.style.display = "none";
    }
}