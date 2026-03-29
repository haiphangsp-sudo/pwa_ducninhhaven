// ui/render/renderStatusBar.js
import { getState, setState } from '../../core/state.js';
import { translate } from '../utils/translate.js';



/* =========================
   PUBLIC
========================= */

// ui/render/renderStatusBar.js
export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    const textEl = document.getElementById("orderStatusText");
    if (!bar || !textEl) return;

    const { status, msg } = state.order;
    const totalQty = state.cart.items.reduce((s, i) => s + i.qty, 0);

    // 1. Nếu không có gì để báo và giỏ trống -> Ẩn
    if (status === "idle" && totalQty === 0) {
        bar.classList.add("hidden");
        return;
    }

    // 2. Cập nhật nội dung dựa trên Status
    bar.classList.remove("hidden");
    bar.className = `status-bar is-${status}`; // is-sending, is-success, is-error...

    if (status !== "idle") {
        textEl.textContent = msg; // Hiển thị thông báo phản hồi
    } else {
        // Nếu idle, hiển thị mặc định: Tên phòng hoặc Số món trong giỏ
        textEl.textContent = state.context.active?.name 
            ? `${state.context.active.name} • ${totalQty} món`
            : `🛒 Giỏ hàng có ${totalQty} món`;
    }
}