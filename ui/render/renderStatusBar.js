// ui/render/renderStatusBar.js
import { getState, setState } from '../../core/state.js';
import { openOrderTracker } from '../components/orderTracker.js';
import { translate } from '../utils/translate.js';



/* =========================
   PUBLIC
========================= */


// ui/render/renderStatusBar.js
export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  const statusText = document.getElementById("orderStatusText");
  if (!bar || !statusText) return;

  const { ack, context, cart } = state;
  const totalQty = (cart.items || []).reduce((sum, i) => sum + i.qty, 0);

  // Hiển thị mặc định
  bar.classList.remove("hidden");
  let msg = context.active?.name || "Đức Ninh Haven";
  bar.className = "status-bar";

  // Các trạng thái ưu tiên hiển thị
  if (ack.status === "sending") {
    msg = "⌛ Đang gửi yêu cầu...";
    bar.classList.add("is-sending");
  } else if (ack.status === "success") {
    msg = "✅ Đã nhận đơn, xin cảm ơn!";
    bar.classList.add("is-success");
  } else if (totalQty > 0) {
    msg = `🛒 ${totalQty} món đang chờ gửi`;
    bar.classList.add("is-pending");
  }

  statusText.textContent = msg;
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