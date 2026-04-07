// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";

export function openOrderTracker(state) {
  const active = state.orders?.active || [];
  const listContainer = document.getElementById("orderTrackerList");

  if (!listContainer) return;

  // 1. Kiểm tra nếu thực sự không có đơn
  if (active.length === 0) {
    listContainer.innerHTML = `<div class="p-xl text-center opacity-50">🍃 ${translate('order.no_active_order') || "Chưa có đơn hàng nào."}</div>`;
    return;
  }

  // 2. Render danh sách
  listContainer.innerHTML = active.map(order => {
    // Ép kiểu ID và xử lý hiển thị
    const safeId = String(order.id || "");
    const shortId = safeId.includes('-') ? safeId.split('-')[1] : safeId;

    // GIẢI MÃ ITEMS (Cực kỳ quan trọng)
    let itemsArray = [];
    try {
      if (typeof order.items === 'string' && order.items.trim() !== "") {
        itemsArray = JSON.parse(order.items);
      } else if (Array.isArray(order.items)) {
        itemsArray = order.items;
      }
    } catch (e) {
      console.error("Lỗi parse JSON món ăn:", e);
      itemsArray = [];
    }

    // Tạo HTML danh sách món
    const itemsHtml = itemsArray.length > 0 
      ? itemsArray.map(i => `<div class="text-m mb-xs">● ${i.qty}x ${i.item || i.name}</div>`).join("")
      : `<div class="opacity-50 italic">Yêu cầu phục vụ</div>`;

    return `
      <div class="order-card p-m mb-m border radius-m bg-white shadow-sm" style="color: #333;">
        <div class="row justify-between items-center mb-m border-b pb-s">
          <span class="text-bold color-brand">#${shortId}</span>
          <span class="status-badge is-${(order.status || 'NEW').toLowerCase()}" 
                style="font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #f0f0f0;">
            ${order.status || 'NEW'}
          </span>
        </div>
        
        <div class="order-details mb-l">
          ${itemsHtml}
        </div>
        
        <div class="stepper-wrapper" style="margin-top: 15px;">
          ${renderStepper(order.status || 'NEW')}
        </div>
      </div>
    `;
  }).join("");
}