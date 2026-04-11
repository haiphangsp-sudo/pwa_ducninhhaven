import { getState } from "../../core/state.js";
import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";
import { formatPrice } from "../utils/formatPrice.js";

export function openOrderTracker(state) {
//const state = getState();
  const active = state.orders?.active || [];
  const inactive = state.orders?.inactive || [];
  const orders = [...active, ...inactive];

  const listContainer = document.getElementById("orderTrackerList");
  if (!listContainer) return;

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

  const cards = orders
    .slice()
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
    .map(order => {
      try {
        return renderOrderCard(order);
      } catch (error) {
        console.error("Render order card failed:", order, error);
        return "";
      }
    })
    .filter(Boolean)
    .join("");

  listContainer.innerHTML = cards || `
    <div class="tracker-empty">
      <div class="tracker-empty__icon">🍃</div>
      <div class="tracker-empty__text">
        ${translate("order.no_active_order")}
      </div>
    </div>
  `;
}

function renderOrderCard(order = {}) {
  const safeId = String(order.id || "");
  const shortId = safeId.includes("-")
    ? safeId.split("-").slice(1).join("-")
    : safeId;
  //const shortId = safeId.includes("-") ? safeId.split("-")[1] : safeId;
  const status = String(order.status || "NEW").toUpperCase();

  const items = parseItems(order.items);
  const itemsHtml = items.length
    ? items.map(renderOrderItem).join("")
    : `<div class="tracker-order__empty">${translate("order.service_request")}</div>`;

  return `
    <article class="tracker-order">
      <div class="tracker-order__head">
        <div class="tracker-order__identity">
          <div class="tracker-order__code">#${escapeHtml(shortId)}</div>
          <div class="tracker-order__meta">
            ${order.placeLabel ? `<span>${escapeHtml(order.placeLabel)}</span>` : ""}
            ${order.createdAt ? `<span>• ${escapeHtml(formatTime(order.createdAt))}</span>` : ""}
          </div>
        </div>

        <div class="tracker-order__status status-badge is-${status.toLowerCase()}">
          ${escapeHtml(status)}
        </div>
      </div>

      <div class="tracker-order__body">
        <div class="tracker-order__items">
          ${itemsHtml}
          <div class="tracker-item total-price">
            <div class="tracker-item__content">
              <span class="tracker-item__name">${translate("order.total")}</span>
            </div>
            <span class="tracker-item__price">${safeFormatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>

      <div class="tracker-order__foot">
        <div class="tracker-order__stepper">
          ${renderStepper(status, true)}
        </div>
      </div>
    </article>
  `;
}

function renderOrderItem(item = {}) {
  const qty = Number(item.qty || 1);
  const name = item.item || item.name || "—";
  const price = Number(item.price || 0);
  const option = item.option;

  return `
    <div class="tracker-item">
      <span class="tracker-item__qty">${qty}×</span>
      <div class="tracker-item__content">
        <span class="tracker-item__name">${escapeHtml(name)}</span>
        ${option ? `<span class="tracker-item__option">${escapeHtml(option)}</span>` : ""}
      </div>
      <span class="tracker-item__price">${safeFormatPrice(price)}</span>
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

function formatTime(value) {
  const ts = Number(value);
  if (!Number.isFinite(ts) || ts <= 0) return "";

  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

function safeFormatPrice(value) {
  try {
    return formatPrice(Number(value || 0));
  } catch (error) {
    console.error("formatPrice failed:", value, error);
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
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