// ui/components/orderTracker.js
import { renderStepper } from "../ui/render/renderStepper.js";

export function openOrderTracker(state) {
  const active = state.orders?.active || [];
  const listContainer = document.getElementById("orderTrackerList");

  if (!listContainer) return;

  if (active.length === 0) {
    listContainer.innerHTML = `<div class="p-xl text-center opacity-50">🍃 Chưa có đơn hàng nào.</div>`;
    return;
  }

  listContainer.innerHTML = active.map(order => {
    // 1. XỬ LÝ ID AN TOÀN: Ép kiểu String để không bị lỗi split
    const safeId = order.id ? String(order.id) : "0000";
    const shortId = safeId.includes('-') ? safeId.split('-')[1] : safeId;

    // 2. GIẢI MÃ ITEMS: Đảm bảo không bị lỗi map trên String
    let itemsArray = [];
    try {
      itemsArray = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    } catch (e) {
      itemsArray = [];
    }

    const itemsHtml = itemsArray.map(i => `
      <div class="row justify-between mb-xs">
        <span>${i.qty}x ${i.item}</span>
      </div>
    `).join("");

    return `
      <div class="order-card p-m mb-m border radius-m bg-white shadow-sm">
        <div class="row justify-between mb-s border-b pb-s">
          <span class="text-bold">#${shortId}</span>
          <span class="status-badge is-${(order.status || 'NEW').toLowerCase()}">${order.status || 'NEW'}</span>
        </div>
        <div class="mb-m">${itemsHtml || "Yêu cầu phục vụ"}</div>
        <div class="stepper-wrapper">
          ${renderStepper(order.status || 'NEW')}
        </div>
      </div>`;
  }).join("");
}