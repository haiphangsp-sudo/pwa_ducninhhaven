// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";

export function openOrderTracker(state) {
    const active = state.orders?.active || [];
    const listContainer = document.getElementById("orderTrackerList");
    
    if (!listContainer) {
        console.warn("Chưa có #orderTrackerList trong HTML");
        return;
    }

    if (active.length === 0) {
        listContainer.innerHTML = `<div class="p-xl text-center opacity-50">Chưa có đơn hàng nào</div>`;
        return;
    }

    listContainer.innerHTML = active.map(order => {
        // BƯỚC QUAN TRỌNG: Kiểm tra nếu items là chuỗi thì phải parse sang mảng
        let itemsArray = [];
        try {
            itemsArray = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        } catch (e) {
            itemsArray = [];
        }

        const itemsHtml = itemsArray.map(i => `<li>${i.qty}x ${i.item}</li>`).join("");

        return `
            <div class="order-card p-m mb-m border radius-m bg-white shadow-sm">
                <div class="row justify-between mb-s">
                    <span class="text-bold">#${order.id.split('-')[1] || order.id}</span>
                    <span class="text-xs opacity-50">${order.time || ''}</span>
                </div>
                <ul class="order-items-list mb-m p-0 list-none text-m color-brand text-bold">
                    ${itemsHtml || "Yêu cầu phục vụ"}
                </ul>
                <div class="stepper-wrapper">
                    ${renderStepper(order.status)}
                </div>
            </div>
        `;
    }).join("");
}