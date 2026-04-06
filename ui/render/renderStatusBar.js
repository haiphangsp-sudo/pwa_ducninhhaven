import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';

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

  const cartItems = state.cart?.items || [];
  const totalCartQty = cartItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  const actionableOrders = activeOrders.filter(
    o => !TERMINAL_STATUSES.includes(o.status)
  );

  btnToggle.dataset.action = "toggle_status";
  btnToggle.dataset.value = String(isBarExpanded);

  btnCheck.dataset.action = "open-overlay";
  btnCheck.dataset.value = "orderTrackerPage";

  // Không có gì → ẩn
  if (actionableOrders.length === 0 && totalCartQty === 0) {
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

  countEl.textContent = String(totalCartQty);
  textEl.textContent = locationName
    ? `${locationName} • ${totalCartQty} món`
    : `Giỏ hàng • ${totalCartQty} món`;

  bar.classList.add("is-idle");
}