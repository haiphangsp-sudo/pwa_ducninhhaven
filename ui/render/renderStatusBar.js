// ui/render/renderStatusBar.js
import { getState, setState } from '../../core/state.js';
import { openOrderTracker } from '../components/orderTracker.js';


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

// Helper để tạo thông báo tinh tế cho Đức Ninh Haven
function getStatusMessage(status, total) {
    const messages = {
        'pending': 'Đang tiếp nhận đơn hàng...',
        'cooking': 'Bếp đang chuẩn bị món...',
        'delivering': 'Đang mang tới phòng của bạn...',
        'recovering': 'Đang phục hồi sự tĩnh lặng...'
    };
    
    const text = messages[status] || 'Đang xử lý...';
    return total > 1 ? `${text} (+${total - 1} đơn khác)` : text;
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