import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';
import { getDrawerExtended } from '../../core/menuQuery.js';
import { translate } from '../utils/translate.js';


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

  const activeOrders = state.orders?.active || [];
  const isBarExpanded = !!state.orders?.isBarExpanded;

  const { totalQty,totalQtyFormat,isEmpty } = getDrawerExtended();


  const actionableOrders = activeOrders.filter(
    o => !TERMINAL_STATUSES.includes(o.status)
  );

  btnToggle.dataset.action = "toggle_status";
  btnToggle.dataset.value = String(isBarExpanded);

  btnCheck.dataset.action = "open-overlay";
    btnCheck.dataset.value = "orderTrackerPage";
    btnCheck.textContent=translate("order.check_detail")

  // Không có gì → ẩn
  if (actionableOrders.length === 0 && isEmpty) {
    bar.className = "status-bar hidden";
    return;
  }

  bar.className = "status-bar";
  bar.classList.toggle("is-expanded", isBarExpanded);
  bar.classList.toggle("is-collapsed", !isBarExpanded);
  bar.classList.remove("hidden");

  /* =========================
     ƯU TIÊN ORDER
  ========================= */
  if (actionableOrders.length > 0) {
    const priorityOrder = getPriorityOrder(actionableOrders);
    const status = priorityOrder?.status || "SYNCING";

    countEl.textContent = String(actionableOrders.length);
    bar.classList.add(`is-${status.toLowerCase()}`);

    if (status === "SYNCING") {
      textEl.textContent = "Đang kiểm tra đơn hàng...";
    } else {
      textEl.innerHTML = renderStepper(status);
    }

    return;
  }

  /* =========================
     FALLBACK: CART
  ========================= */
    const locationName = getLocationInfo()?.placeName;
    getDrawerExtended();

  countEl.textContent = totalQty;
  textEl.textContent = locationName
    ? `${locationName} • ${totalQtyFormat}`
    : `${translate("cart_bar.cart_title")}: • ${totalQtyFormat}`;

  bar.classList.add("is-idle");
}