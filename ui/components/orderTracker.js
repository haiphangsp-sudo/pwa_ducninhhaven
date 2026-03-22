// ui/components/orderTracker.js

import { showOverlay } from "../interactions/backdropManager.js";
import { renderStepper } from "../render/renderStepper.js";
import { getState } from "../../core/state.js";


/* =========================
   PUBLIC
========================= */



export function openOrderTracker() {
    const { active } = getState().orders;
    const trackerPage = document.getElementById("orderTrackerPage");
    const listContainer = document.getElementById("orderTrackerList"); // Cần thêm id này vào HTML của bạn

    // 1. Hiển thị Overlay
    showOverlay("orderTrackerList");


    // 2. Kiểm tra nếu không có đơn
    if (!active || active.length === 0) {
        listContainer.innerHTML = `<div class="p-xl center text-muted">Bạn chưa có đơn hàng nào đang xử lý.</div>`;
        return;
    }

    // 3. Render danh sách đơn hàng
    listContainer.innerHTML = active.map(order => `
        <div class="order-card p-m radius-m bg-white mb-m shadow-sm">
            <div class="row justify-between items-center mb-s">
                <span class="text-bold text-s">Đơn #${order.id}</span>
                <span class="text-xs text-muted">${order.time || ''}</span>
            </div>
            <div class="order-items-summary mb-m text-m color-brand">
                ${order.items.map(item => item.name).join(", ")}
            </div>
            
            <div class="stepper-container">
                ${renderStepper(order.status)}
            </div>
        </div>
    `).join("");
}