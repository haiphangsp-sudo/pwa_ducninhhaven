// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';
import { getDrawerExtended } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { STRINGS } from "../../data/i18n.js";

const TERMINAL_STATUSES = ['RECOVERING', 'CANCELED'];

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;

  const isExpanded = !!state.orders?.isBarExpanded;
  const activeOrders = (state.orders?.active || []).filter(
    o => !TERMINAL_STATUSES.includes(o.status)
  );
  const { totalQty } = getDrawerExtended();
  const lang = state.lang?.current || 'vi';

  // 1. Logic Ẩn/Hiện
  if (activeOrders.length === 0 && totalQty === 0) {
    bar.className = "status-bar hidden";
    return;
  }

  // 2. Thiết lập trạng thái Capsule (Co/Giãn)
  bar.className = `status-bar ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;

  const priorityOrder = activeOrders.reduce((best, current) => {
    const scores = { DONE: 5, DELIVERING: 4, COOKING: 3, NEW: 2, SYNCING: 1 };
    return (scores[current.status] || 0) > (scores[best?.status] || 0) ? current : best;
  }, null);

  const status = priorityOrder?.status || "SYNCING";
  const statusMsg = STRINGS.status[`msg_${status}`]?.[lang] || "";

  // 3. RENDER TOÀN PHẦN (Giống mẫu bạn chọn)
  bar.innerHTML = `
    <div class="bar-layout">
      <div class="bar-left" data-action="toggle_status" data-value="${isExpanded}">
        <div class="bell-wrapper">
          <span class="bell-icon">🔔</span>
          <div class="count-badge">${activeOrders.length || totalQty}</div>
        </div>
      </div>

      <div class="bar-center">
        <div class="status-stack">
          <div class="status-msg-top">${statusMsg}</div>
          <div class="stepper-full-wrap">
            ${renderStepper(status)}
          </div>
        </div>
      </div>

      <div class="bar-right">
        <button class="btn-haven-gold" data-action="open-overlay" data-value="trackerPage">
          ${translate("order.button")}
        </button>
        <div class="toggle-arrow" data-action="toggle_status" data-value="${isExpanded}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  `;
}