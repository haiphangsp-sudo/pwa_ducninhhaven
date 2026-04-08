// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';
import { getDrawerExtended } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { STRINGS } from "../../data/i18n.js";

const TERMINAL_STATUSES = ['RECOVERING', 'CANCELED'];

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
  if (!bar) return;

  const lang = state.lang?.current || 'vi';
  const activeOrders = state.orders?.active || [];
  const isBarExpanded = !!state.orders?.isBarExpanded;
  const { totalQty } = getDrawerExtended();

  const actionableOrders = activeOrders.filter(
    order => !TERMINAL_STATUSES.includes(order.status)
  );

  // 1. Logic ẩn thanh bar
  if (actionableOrders.length === 0 && totalQty === 0) {
    bar.className = "status-bar hidden";
    return;
  }

  // Cập nhật class trạng thái
  const priorityOrder = getPriorityOrder(actionableOrders);
  const status = priorityOrder?.status || "SYNCING";
  bar.className = `status-bar is-${status.toLowerCase()} ${isBarExpanded ? 'is-expanded' : 'is-collapsed'}`;

  // 2. Chuẩn bị nội dung hiển thị
  let contentHtml = "";

  if (actionableOrders.length > 0) {
    const statusMsg = STRINGS.status[`msg_${status}`]?.[lang] || "";
    
    contentHtml = `
      <div class="bar-layout">
        <div class="bar-left">
          <div class="order-count-badge">${actionableOrders.length}</div>
        </div>

        <div class="bar-center">
          <div class="status-stack">
            <div class="status-msg-top">${statusMsg}</div>
            <div class="stepper-mini-wrap">
              ${renderStepper(status)}
            </div>
            <div class="status-label-bottom">${status}</div>
          </div>
        </div>

        <div class="bar-right">
          <button id="btnCheckOrders" class="btn-check-haven" 
                  data-action="open-overlay" data-value="orderTrackerPage">
            ${translate("order.button")}
          </button>
          <div id="btnToggleBar" class="toggle-arrow" data-action="toggle_status" data-value="${isBarExpanded}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    `;
  } else {
    // Trạng thái chờ (Idle) khi chỉ có giỏ hàng
    const { placeName } = getLocationInfo();
    contentHtml = `
      <div class="bar-layout is-idle">
        <div class="bar-left">
          <div class="order-count-badge is-cart">${totalQty}</div>
        </div>
        <div class="bar-center">
          <div class="place-name-display">${placeName}</div>
        </div>
        <div class="bar-right">
          <div id="btnToggleBar" class="toggle-arrow" data-action="toggle_status">
             <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    `;
  }

  bar.innerHTML = contentHtml;
}