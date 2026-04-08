// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getDrawerExtended } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { STRINGS } from "../../data/i18n.js";

const TERMINAL_STATUSES = ['RECOVERING', 'CANCELED'];
// ui/render/renderStatusBar.js
// ... (giữ nguyên phần import và priority logic) ...

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;

  const isBarExpanded = !!state.orders?.isBarExpanded; // Lấy trạng thái từ State
  const activeOrders = state.orders?.active || [];
  const { totalQty } = getDrawerExtended();

  const actionableOrders = activeOrders.filter(
    order => !TERMINAL_STATUSES.includes(order.status)
  );

  if (actionableOrders.length === 0 && totalQty === 0) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");

  // QUAN TRỌNG: Thêm class điều khiển thu gọn/mở rộng
  bar.className = `status-bar ${isBarExpanded ? 'is-expanded' : 'is-collapsed'}`;

  const priorityOrder = actionableOrders.reduce((best, current) => {
    const scores = { RECOVERING: 6, DONE: 5, DELIVERING: 4, COOKING: 3, NEW: 2, SYNCING: 1 };
    return (scores[current.status] || 0) > (scores[best?.status] || 0) ? current : best;
  }, null);

  const status = priorityOrder?.status || "SYNCING";
  const statusMsg = STRINGS.status[`msg_${status}`]?.[getState().lang?.current || 'vi'] || "";

  bar.innerHTML = `
    <div class="bar-layout">
      <div class="bar-left">
        <div class="order-count-badge">${actionableOrders.length || totalQty}</div>
      </div>

      <div class="bar-center">
        <div class="status-stack">
          <div class="status-msg-top">${statusMsg}</div>
          <div class="stepper-mini-wrap">${renderStepper(status)}</div>
          <div class="status-label-bottom">${status}</div>
        </div>
      </div>

      <div class="bar-right">
        <button class="btn-check-haven" data-action="open-overlay" data-value="orderTrackerPage">
          ${translate("order.button")}
        </button>
        <div class="toggle-arrow" data-action="toggle_status" data-value="${isBarExpanded}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  `;
}