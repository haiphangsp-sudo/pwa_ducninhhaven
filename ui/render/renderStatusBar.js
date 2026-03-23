// ui/render/renderStatusBar.js
import { getState, setState } from '../../core/state.js';
import { openOrderTracker } from '../components/orderTracker.js';
import { translate } from '../utils/translate.js';



/* =========================
   PUBLIC
========================= */

export function renderStatusBar() {
    const { active, isBarExpanded } = getState().orders;
    const bar = document.getElementById("orderStatusBar");
    const countEl = document.getElementById("orderActiveCount");
    const statusTextEl = document.getElementById("orderStatusText");
    const toggleBtn = document.getElementById("btnToggleBar");

    // 1. Kiểm tra nếu không có đơn hàng nào thì ẩn thanh bar
    if (!active || active.length === 0) {
        bar.classList.add("hidden");
        return;
    }

    // 2. Hiển thị thanh bar và xử lý trạng thái Thu nhỏ/Mở rộng
    bar.classList.remove("hidden");
    bar.classList.toggle("is-collapsed", !isBarExpanded);
    toggleBtn.textContent = isBarExpanded ? "❯" : "❮";

    // 3. Cập nhật số lượng đơn hàng đang hoạt động (chưa DONE)
    const pendingOrders = active.filter(o => o.status !== 'done');
    countEl.textContent = pendingOrders.length;

    // 4. Cập nhật nội dung hiển thị dựa trên đơn hàng mới nhất
    if (isBarExpanded && pendingOrders.length > 0) {
        const latestOrder = pendingOrders[pendingOrders.length - 1];
        // Sử dụng helper để chuyển mã status thành ngôn ngữ Wellness
        statusTextEl.textContent = getStatusMessage(latestOrder.status, pendingOrders.length);
    }
}

/* =========================
   EVENTS
========================= */

export function attachStatusBarEvents() {
    // Gắn sự kiện cho nút Toggle ( > và < )
    document.getElementById("btnToggleBar")?.addEventListener("click", () => {
        const isExpanded = getState().orders.isBarExpanded;
        setState({ orders: { isBarExpanded: !isExpanded } });
        renderStatusBar(); // Vẽ lại ngay để thấy hiệu ứng
    });

    // Gắn sự kiện cho nút "Kiểm tra ❯"
    document.getElementById("btnCheckOrders")?.addEventListener("click", () => {
        openOrderTracker(); // Mở trang chi tiết (Tracker Page)
    });
}

/* =========================
   PRIVATE
========================= */

function getStatusMessage(status, total) {
    // 1. Tìm tin nhắn dài (msg_NEW, msg_COOKING...)
    // 2. Nếu không có, dùng nhãn ngắn (NEW, COOKING...)
    // 3. Nếu vẫn không có, dùng mặc định "Đang xử lý"
    const text = translate(`status.msg_${status}`) || 
                 translate(`status.${status}`) || 
                 "Đang xử lý...";

    return total > 1 ? `${text} (+${total - 1})` : text;
}