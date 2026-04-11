// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";
import { formatPrice } from "../utils/formatPrice.js";
import { getActionableOrders, getRecentInactiveOrders } from "../../core/orders.js";

export function openOrderTracker(state) {
  const listContainer = document.getElementById("orderTrackerList");
  if (!listContainer) return;

  const activeOrders = getActionableOrders(); // Đơn đang chạy
  const historyOrders = getRecentInactiveOrders(); // Đơn đã xong/hủy

  if (activeOrders.length === 0 && historyOrders.length === 0) {
    listContainer.innerHTML = `
      <div class=\"tracker-empty\">
        <div class=\"tracker-empty__icon\">🍃</div>
        <div class=\"tracker-empty__text\">${translate("order.no_active_order")}</div>
      </div>`;
    return;
  }

  let html = "";

  // --- PHẦN 1: ĐƠN HÀNG ĐANG XỬ LÝ (Hiện Stepper đầy đủ) ---
  if (activeOrders.length > 0) {
    html += `<h3 class=\"tracker-section-title\">${translate("order.active_title") || "Đang xử lý"}</h3>`;
    html += activeOrders
      .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
      .map(order => renderOrderCard(order, true)) // true: hiện stepper
      .join("");
  }

  // --- PHẦN 2: LỊCH SỬ ĐẶT MÓN (Gọn gàng hơn) ---
  if (historyOrders.length > 0) {
    html += `<div class=\"tracker-history-divider\"></div>`;
    html += `<h3 class=\"tracker-section-title history\">${translate("order.history_title") || "Lịch sử đặt món"}</h3>`;
    html += `<div class=\"tracker-history-list\">
      ${historyOrders
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
        .map(order => renderOrderCard(order, false)) // false: ẩn stepper cho gọn
        .join("")}
    </div>`;
  }

  listContainer.innerHTML = html;
}

function renderOrderCard(order = {}, showStepper = true) {
  const status = order.status || "NEW";
  const items = parseItems(order.items);
  const time = formatTime(order.updatedAt || order.createdAt);
  
  // Thêm class 'is-history' nếu không hiện stepper
  return `
    <article class=\"tracker-order ${!showStepper ? "is-history" : ""}\">
      <div class=\"tracker-order__header\">
        <span class=\"tracker-order__id\">#${order.id.split("-").slice(-1)}</span>
        <span class=\"tracker-order__time\">${time}</span>
      </div>

      <div class=\"tracker-order__content\">
        <div class=\"tracker-order__items\">
          ${items.map(item => renderOrderItem(item)).join("")}
        </div>
        
        <div class=\"tracker-order__total\">
          <span>${translate("order.total")}</span>
          <span class=\"total-value\">${formatPrice(order.totalPrice)}</span>
        </div>

        ${showStepper ? `
          <div class=\"tracker-order__stepper\">
            ${renderStepper(status, true)}
          </div>
        ` : `
          <div class=\"tracker-order__status-badge ${status.toLowerCase()}\">
            ${status === "DONE" ? "✓ Đã hoàn tất" : "✕ Đã hủy"}
          </div>
        `}
      </div>
    </article>
  `;
}