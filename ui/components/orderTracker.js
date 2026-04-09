import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";

export function openOrderTracker(state) {
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];
  const orders = [...active, ...inactive];

  const listContainer = document.getElementById("orderTrackerList");
  if (!listContainer) {
    console.warn("orderTrackerList not found");
    return;
  }

  if (orders.length === 0) {
    listContainer.innerHTML = `
      <div class="tracker-empty">
        <div class="tracker-empty__icon">🍃</div>
        <div class="tracker-empty__text">
          ${translate("order.no_active_order")}
        </div>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = orders
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    .map(renderOrderCard)
    .join("");
}

function renderOrderCard(order) {
  const safeId = String(order.id || "");
  const shortId = safeId.includes("-") ? safeId.split("-")[1] : safeId;
  const status = order.status || "NEW";

  const items = parseItems(order.items);
  const itemsHtml = items.length
    ? items.map(renderOrderItem).join("")
    : `<div class="tracker-order__empty">${translate("order.service_request")}</div>`;

  return `
    <article class="tracker-order">
      <div class="tracker-order__head">
        <div class="tracker-order__identity">
          <div class="tracker-order__code">#${shortId}</div>
          <div class="tracker-order__meta">
            ${order.placeLabel ? `<span>${escapeHtml(order.placeLabel)}</span>` : ""}
            ${order.time ? `<span>• ${escapeHtml(order.time)}</span>` : ""}
          </div>
        </div>

        <div class="tracker-order__status status-badge is-${status.toLowerCase()}">
          ${escapeHtml(status)}
        </div>
      </div>

      <div class="tracker-order__body">
        <div class="tracker-order__items">
          ${itemsHtml}
        </div>
      </div>

      <div class="tracker-order__foot">
        <div class="tracker-order__stepper">
          ${renderStepper(status, true )}
        </div>
      </div>
    </article>
  `;
}

function renderOrderItem(item = {}) {
  const qty = Number(item.qty || 1);
  const name = item.item || item.name || translate("order.unnamed_item") || "Mục chưa tên";

  return `
    <div class="tracker-item">
      <span class="tracker-item__qty">${qty}×</span>
      <span class="tracker-item__name">${escapeHtml(name)}</span>
    </div>
  `;
}

function parseItems(raw) {
  try {
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error("Parse order items failed:", error);
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}