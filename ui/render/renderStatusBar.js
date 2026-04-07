// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';
import { getDrawerExtended } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { STRINGS } from "../../data/i18n.js";

// RECOVERING và CANCELED sẽ làm thanh bar ẩn đi (hoặc vào kho lưu trữ)
const TERMINAL_STATUSES = ['RECOVERING', 'CANCELED'];

// Thứ tự ưu tiên hiển thị nếu khách có nhiều đơn hàng cùng lúc
const ORDER_PRIORITY = {
  RECOVERING: 6,
  DONE: 5,
  DELIVERING: 4,
  COOKING: 3,
  NEW: 2,
  SYNCING: 1
};

function getPriorityOrder(orders = []) {
  return orders.reduce((best, current) => {
    if (!best) return current;
    const bestScore = ORDER_PRIORITY[best.status] || 0;
    const currentScore = ORDER_PRIORITY[current.status] || 0;
    return currentScore > bestScore ? current : best;
  }, null);
}

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  const countEl = document.getElementById("orderActiveCount");
  const textEl = document.getElementById("orderStatusText");
  const btnCheck = document.getElementById("btnCheckOrders");
  const btnToggle = document.getElementById("btnToggleBar");

  if (!bar || !countEl || !textEl || !btnCheck || !btnToggle) return;

  const lang = state.lang?.current || 'vi';
  const activeOrders = state.orders?.active || [];
  const isBarExpanded = !!state.orders?.isBarExpanded;
  const { totalQty } = getDrawerExtended();

  // Lọc các đơn chưa kết thúc
  const actionableOrders = (state.orders?.active || []).filter(
    order => !TERMINAL_STATUSES.includes(order.status)
  );

  // 1. Logic Ẩn/Hiện thanh Bar
  if (actionableOrders.length === 0 && getDrawerExtended().totalQty === 0) {
    bar.className = "status-bar hidden";
    return;
  }

  bar.className = `status-bar ${isBarExpanded ? 'is-expanded' : 'is-collapsed'}`;
  
  // 2. Gán dữ liệu cho các nút bấm
  btnToggle.dataset.action = "toggle_status";
  btnToggle.dataset.value = String(isBarExpanded);
  
  btnCheck.dataset.action = "open-overlay";
  btnCheck.dataset.value = "trackerPage";
  btnCheck.textContent = translate("order.button");

  // 3. Hiển thị nội dung chính
  if (actionableOrders.length > 0) {
    const priorityOrder = getPriorityOrder(actionableOrders);
    const status = priorityOrder?.status || "SYNCING";

    countEl.textContent = String(actionableOrders.length);
    
    // Xóa class cũ và thêm class trạng thái mới (để CSS đổi màu nâu/xanh)
    bar.className = bar.className.replace(/\bis-\S+/g, '');
    bar.classList.add(`is-${String(status).toLowerCase()}`);

    if (status === "SYNCING") {
      textEl.textContent = translate("order.check");
    } else {
      // Lấy câu thông báo tương ứng (Bếp đang chuẩn bị...) và render Stepper
      const statusMsg = STRINGS.status[`msg_${status}`]?.[lang] || "";
      textEl.innerHTML = `
        <div class="status-msg">${statusMsg}</div>
        ${renderStepper(status)}
      `;
    }
  } else {
    // Trường hợp giỏ hàng có món nhưng chưa gửi đơn
    const { placeName } = getLocationInfo();
    countEl.textContent = String(totalQty);
    textEl.textContent = placeName;
    bar.classList.add("is-idle");
  }
}