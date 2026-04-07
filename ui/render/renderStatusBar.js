import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';
import { getDrawerExtended } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";

const TERMINAL_STATUSES = ['DONE', 'RECOVERING', 'CANCELED'];

const ORDER_PRIORITY = {
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

    if (currentScore !== bestScore) {
      return currentScore > bestScore ? current : best;
    }

    // nếu cùng trạng thái, ưu tiên đơn mới hơn ở cuối mảng
    return current;
  }, null);
}

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  const countEl = document.getElementById("orderActiveCount");
  const textEl = document.getElementById("orderStatusText");
  const btnCheck = document.getElementById("btnCheckOrders");
  const btnToggle = document.getElementById("btnToggleBar");

  if (!bar || !countEl || !textEl || !btnCheck || !btnToggle) return;

  const activeOrders = state.orders?.active || [];
  const isBarExpanded = !!state.orders?.isBarExpanded;
  const { totalQty, totalQtyFormat} = getDrawerExtended();

  const actionableOrders = activeOrders.filter(
    order => !TERMINAL_STATUSES.includes(order.status)
  );

  btnToggle.dataset.action = "toggle_status";
  btnToggle.dataset.value = String(isBarExpanded);

  btnCheck.dataset.action = "open-overlay";
  btnCheck.dataset.value = "orderTrackerPage";

  if (actionableOrders.length === 0 && totalQty === 0) {
    bar.className = "status-bar hidden";
    return;
  }

  bar.className = "status-bar";
  bar.classList.toggle("is-expanded", isBarExpanded);
  bar.classList.toggle("is-collapsed", !isBarExpanded);
  bar.classList.remove("hidden");

  if (actionableOrders.length > 0) {
    const priorityOrder = getPriorityOrder(actionableOrders);
    const status = priorityOrder?.status || "SYNCING";

    countEl.textContent = String(actionableOrders.length);
    bar.classList.add(`is-${String(status).toLowerCase()}`);

    if (status === "SYNCING") {
      textEl.textContent = translate("order.check");
    } else {
      textEl.innerHTML = renderStepper(status);
    }

    return;
  }
  const { hasPlace, placeName } = getLocationInfo();
  

  countEl.textContent = totalQty;
  textEl.textContent = hasPlace
    ? `${placeName} • ${totalQtyFormat}`
    : `${translate("cart_bar.cart_title")}: • ${totalQtyFormat}`;

  bar.classList.add("is-idle");
}
