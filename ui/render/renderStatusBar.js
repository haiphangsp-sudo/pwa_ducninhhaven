// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getDrawerExtended } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { STRINGS } from "../../data/i18n.js";

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;

  const isExpanded = !!state.orders?.isBarExpanded;
  const activeOrders = state.orders?.active || [];
  const { totalQty } = getDrawerExtended();
  const lang = state.lang?.current || 'vi';

  // Lọc các đơn hàng đang hoạt động
  const actionableOrders = activeOrders.filter(o => !['RECOVERING', 'CANCELED'].includes(o.status));

  // Ẩn thanh bar nếu không có gì để hiển thị
  if (actionableOrders.length === 0 && totalQty === 0) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");

  // Gán class để điều khiển đóng/mở
  bar.className = `status-bar ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;

  // Xác định trạng thái ưu tiên
  const priorityOrder = actionableOrders.reduce((best, current) => {
    const scores = { DONE: 5, DELIVERING: 4, COOKING: 3, NEW: 2, SYNCING: 1 };
    return (scores[current.status] || 0) > (scores[best?.status] || 0) ? current : best;
  }, null);

  const status = priorityOrder?.status || "SYNCING";
  const statusMsg = STRINGS.status[`msg_${status}`]?.[lang] || "";

  // RENDER TOÀN PHẦN: Không dùng textEl, không dùng countEl
  bar.innerHTML = `
    <div class="bar-left">
      <div class="order-count-badge">${actionableOrders.length || totalQty}</div>
    </div>

    <div class="bar-center">
      <div class="status-stack">
        <div class="status-msg-top">${statusMsg}</div>
        <div class="stepper-mini-container">
          ${renderStepper(status)}
        </div>
        <div class="status-label-bottom">${status}</div>
      </div>
    </div>

    <div class="bar-right">
      <button class="btn-check-main" data-action="open-overlay" data-value="orderTrackerPage">
        ${translate("order.button")}
      </button>
      <div class="toggle-arrow" data-action="toggle_status" data-value="${isExpanded}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  `;
}