import { renderStepper } from "./renderStepper.js";
import { translate } from "../utils/translate.js";
import { getActionableOrders, getRecentInactiveOrders } from "../../core/orders.js";

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;
  const actionable = getActionableOrders();
  const history = getRecentInactiveOrders();
  const nocactive = actionable.length === 0;


// Chỉ ẩn khi thực sự không có gì để xem
if (nocactive && history.length === 0) {
  bar.classList.add("hidden");
  return;
}

  const isExpanded = !!state.orders?.isBarExpanded;

  bar.classList.remove("hidden");
  bar.classList.toggle("is-expanded", isExpanded);
  bar.classList.toggle("is-collapsed", !isExpanded);

  bar.innerHTML = `
    <div class="bar-center">
      <div class="stepper">
        ${!nocactive?renderStepper(actionable[0].status, false):translate("order.no_active_order")}
      </div>
      <div class="check-orders">
        <button class="btn-check-orders" data-action="open-overlay" data-value="orderTrackerPage">
          ${translate("order.button")}
        </button>
      </div>
    </div>

    <div class="bar-right">
      <div class="toggle-arrow" data-action="toggle_status" data-value="${isExpanded}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="8 18 16 12 8 6"></polyline>
        </svg>
      </div>
    </div>
  `;
}