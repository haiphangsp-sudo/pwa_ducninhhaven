import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";
import { formatPrice } from "../utils/formatPrice.js";
import {
  getActionableOrders,
  getRecentInactiveOrders,
  getSyncingOrders
} from "../../core/orders.js";
import { getState } from "../../core/state.js";

export function openOrderTracker() {
  const listContainer = document.getElementById("orderTrackerList");
  if (!listContainer) return;

  const activeOrders = getActionableOrders();
  const historyOrders = getRecentInactiveOrders();
  const syncingOrders = getSyncingOrders();
  const titleOrder = document.querySelector(".tracker-title");

  if (titleOrder) {
    titleOrder.textContent = translate("order.status");
  }

  if (activeOrders.length === 0 && historyOrders.length === 0) {
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

  let html = "";

  if (syncingOrders.length > 0) {
    html += `
      <div class="tracker-syncing-notice">
        <div class="sync-spinner"></div>
        <span>${translate("order.syncing_msg")}</span>
      </div>
    `;
  }

  if (activeOrders.length > 0) {
    html += `<h3 class="tracker-section-title">${translate("order.active_title")}</h3>`;
    html += activeOrders
      .slice()
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
      .map(order => renderOrderCard(order, true))
      .join("");
  }

  if (historyOrders.length > 0) {
    html += `<div class="tracker-history-divider"></div>`;
    html += `<h3 class="tracker-section-title history">${translate("order.history_title")}</h3>`;
    html += `<div class="tracker-history-list">
      ${historyOrders
        .slice()
        .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
        .map(order => renderOrderCard(order, false))
        .join("")}
    </div>`;
  }

  listContainer.innerHTML = html;
}

function renderOrderCard(order = {}, showStepper = true) {
  const status = String(order.status || "NEW").toUpperCase();
  const items = parseItems(order.items);

  if (!Array.isArray(items) || items.length === 0) {
    if (order.status === "SYNCING") {
      return `<div class="order-card-loading">${translate("order.syncing_msg")}</div>`;
    }
    return "";
  }

  const time = formatTime(order.updatedAt || order.createdAt);
  const shortId = getShortOrderId(order.id);
  const placeLabel = getOrderPlaceLabel(order);

  return `
    <article class="tracker-order ${!showStepper ? "is-history" : ""}">
      <div class="tracker-order__header">
        <div class="tracker-order__main">
          <div class="tracker-order__code">#${escapeHtml(shortId)}</div>
          <span class="tracker-order__status status-badge is-${status.toLowerCase()}">
            ${status}
          </span>
        </div>

        <div class="tracker-order__meta">
          ${placeLabel ? `<span>${escapeHtml(placeLabel)}</span>` : ""}
          ${time ? `<span class="tracker-order__time">${translate("order.time")}: ${escapeHtml(time)}</span>` : ""}
        </div>
      </div>

      <div class="tracker-order__content">
        <div class="tracker-order__items">
          ${items.map(item => renderOrderItem(item)).join("")}
        </div>

        <div class="tracker-item total-price">
          <div class="tracker-item__content">
            <span class="tracker-item__name">${translate("order.total")}</span>
          </div>
          <span class="tracker-item__price">${formatPrice(Number(order.totalPrice || 0))}</span>
        </div>

        ${showStepper ? `
          <div class="tracker-order__stepper">
            ${renderStepper(status, true)}
          </div>
        ` : ""}
        <div class="tracker-item>
          <span class="tracker-tracker_note">${translate("status.tracker_note")}</span>
        </div>
      </div>
    </article>
  `;
}

function renderOrderItem(item = {}) {
  const qty = Number(item.qty || 1);
  const price = Number(item.price || 0);

  const product = getItemText(item.itemLabel || item.item || translate("order.unnamed_item"));
  const variant = getItemText(item.optionLabel || item.option || "");

  return `
    <div class="tracker-item">
      <span class="tracker-item__qty">${qty}×</span>
      <div class="tracker-item__content">
        <span class="tracker-item__name">${escapeHtml(product)}</span>
        ${variant ? `<span class="tracker-item__option">${escapeHtml(variant)}</span>` : ""}
      </div>
      <span class="tracker-item__price">${formatPrice(price)}</span>
    </div>
  `;
}

function getItemText(value) {
  if (!value) return "";

  // Hỗ trợ tương lai nếu bạn lưu dạng { vi, en }
  if (typeof value === "object") {
    const lang = getState().lang?.current || "vi";
    return value[lang] || value.vi || value.en || "";
  }

  return String(value);
}

function getOrderPlaceLabel(order = {}) {
  const placeId = order.placeId || order.place || "";
  const anchorId = order.anchorId || "";
  const placeLabel = getPlaceDisplayLabel(placeId, order.placeLabel || placeId);
  const anchorLabel = getPlaceDisplayLabel(anchorId, anchorId);

  if (!anchorId) return placeLabel;
  if (!placeId) return anchorLabel;
  if (anchorId === placeId) return anchorLabel;

  return `${anchorLabel} → ${placeLabel}`;
}

function getPlaceDisplayLabel(placeId, fallback = "") {
  if (!placeId) return fallback;

  const state = getState();
  const index = state.places?.data?.index || {};
  const place = index[placeId];

  if (place?.label) {
    return translate(place.label);
  }

  return fallback || placeId;
}

function parseItems(raw) {
  try {
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }

    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error("Parse order items failed:", raw, error);
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

function getShortOrderId(id) {
  const safeId = String(id || "");
  return safeId.includes("-")
    ? safeId.split("-").slice(1).join("-")
    : safeId;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}