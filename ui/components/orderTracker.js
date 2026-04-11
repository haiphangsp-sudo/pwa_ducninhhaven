// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";
import { formatPrice } from "../utils/formatPrice.js";
import { getActionableOrders, getRecentInactiveOrders } from "../../core/orders.js";

/**
 * Mở trang theo dõi đơn hàng với 2 phân vùng: Đang xử lý & Lịch sử
 */
export function openOrderTracker(state) {
  const listContainer = document.getElementById("orderTrackerList");
  if (!listContainer) return;

  const activeOrders = getActionableOrders(); 
  const historyOrders = getRecentInactiveOrders(); 

  if (activeOrders.length === 0 && historyOrders.length === 0) {
    listContainer.innerHTML = `
      <div class="tracker-empty">
        <div class="tracker-empty__icon">🍃</div>
        <div class="tracker-empty__text">${translate("order.no_active_order")}</div>
      </div>`;
    return;
  }

  let html = "";

  // 1. PHẦN ĐƠN HÀNG ĐANG XỬ LÝ (Hiện Stepper)
  if (activeOrders.length > 0) {
    html += `<h3 class="tracker-section-title">${translate("order.active_title")}</h3>`;
    html += activeOrders
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
      .map(order => renderOrderCard(order, true))
      .join("");
  }

  // 2. PHẦN LỊCH SỬ (Hiện Badge trạng thái)
  if (historyOrders.length > 0) {
    html += `<div class="tracker-history-divider"></div>`;
    html += `<h3 class="tracker-section-title history">${translate("order.history_title")}</h3>`;
    html += `<div class="tracker-history-list">
      ${historyOrders
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
        .map(order => renderOrderCard(order, false))
        .join("")}
    </div>`;
  }

  listContainer.innerHTML = html;
}

function renderOrderCard(order = {}, showStepper = true) {
  const status = order.status || "NEW";
  const items = parseItems(order.items);
  const time = formatTime(order.updatedAt || order.createdAt);
  
  return `
    <article class="tracker-order ${!showStepper ? "is-history" : ""}">
      <div class="tracker-order__header">
        <span class="tracker-order__id">#${order.id.split("-").slice(-1)}</span>
        <span class="tracker-order__time">${time}</span>
      </div>

      <div class="tracker-order__content">
        <div class="tracker-order__items">
          ${items.map(item => renderOrderItem(item)).join("")}
        </div>
        
        <div class="tracker-order__total">
          <span>${translate("order.total")}</span>
          <span class="total-value">${formatPrice(order.totalPrice)}</span>
        </div>

        ${showStepper ? `
          <div class="tracker-order__stepper">
            ${renderStepper(status, true)}
          </div>
        ` : `
          <div class="tracker-order__status-badge ${status.toLowerCase()}">
            ${status === "DONE" ? "✓ Đã hoàn tất" : "✕ Đã hủy"}
          </div>
        `}
      </div>
    </article>
  `;
}

/* ============================================================
   HÀM BỔ TRỢ (HELPERS) - ĐỪNG XÓA CÁC HÀM NÀY
   ============================================================ */

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
      <span class="tracker-item__price">${formatPrice(price)}</span>
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
  } catch (e) {
    return "";
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}