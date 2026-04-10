import { renderStepper } from "./renderStepper.js";
import { translate } from "../utils/translate.js";

function formatTime(ts) {
  if (!ts) return "";
  try {
    return new Date(Number(ts)).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;

  const isExpanded = !!state.orders?.isBarExpanded;

  const activeOrders = state.orders?.active || [];
  const inactiveOrders = state.orders?.inactive || [];

  if (activeOrders.length === 0 && inactiveOrders.length === 0) {
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");
  bar.classList.toggle("is-expanded", isExpanded);
  bar.classList.toggle("is-collapsed", !isExpanded);

  const visibleOrders = [...activeOrders]
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

  const currentOrder = visibleOrders[0] || null;

  const status = currentOrder?.status || "SYNCING";
  const id = currentOrder?.id || "";
  const shortId = id.includes("-") ? id.split("-")[1] : id;

  const place = currentOrder?.placeLabel || "";
  const time = formatTime(currentOrder?.createdAt);

  bar.innerHTML = `
    <div class="bar-left">
      ${shortId ? `<span class="order-code">#${shortId}</span>` : ""}
      ${place ? `<span class="order-place">${place}</span>` : ""}
      ${time ? `<span class="order-time">• ${time}</span>` : ""}
    </div>

    <div class="bar-center">
      <div class="stepper">
        ${renderStepper(status, false)}
      </div>
    </div>

    <div class="bar-right">
      <button class="btn-check-orders"
        data-action="open-overlay"
        data-value="orderTrackerPage">
        ${translate("order.button")}
      </button>

      <div class="toggle-arrow"
        data-action="toggle_status"
        data-value="${isExpanded}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="8 18 16 12 8 6"></polyline>
        </svg>
      </div>
    </div>
  `;
}