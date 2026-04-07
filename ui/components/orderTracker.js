// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";

export function openOrderTracker(state) {
  const active = state.orders?.active || [];
  const listContainer = document.getElementById("orderTrackerList");

  if (!listContainer) return;

  if (active.length === 0) {
    listContainer.innerHTML = `<div class="p-xl text-center opacity-50">🍃 Chưa có đơn hàng nào.</div>`;
    return;
  }

  listContainer.innerHTML = active.map(order => {
    // BƯỚC QUAN TRỌNG: Chuyển chuỗi JSON từ Sheets thành Mảng để loop
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
          <span class="text-bold">#${order.id.split('-')[1] || order.id}</span>
          <span class="status-badge is-${order.status.toLowerCase()}">${order.status}</span>
        </div>
        <div class="mb-m">${itemsHtml}</div>
        <div class="stepper-wrapper">
          ${renderStepper(order.status)}
        </div>
      </div>`;
  }).join("");
}