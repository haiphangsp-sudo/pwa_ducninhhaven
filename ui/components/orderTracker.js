// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";

export function openOrderTracker(state) {
    const active = state.orders?.active || [];
    const listContainer = document.getElementById("orderTrackerList");
    if (!listContainer) return;

    if (active.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">Bạn chưa có đơn hàng nào.</div>`;
        return;
    }

    listContainer.innerHTML = active.map(order => {
        // Giải mã items nếu nó là chuỗi JSON
        let itemsList = [];
        try {
            itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        } catch(e) { itemsList = []; }

        const itemsNames = itemsList.map(i => `${i.qty}x ${i.item}`).join(", ");

        return `
            <div class="order-card p-m mb-m border radius-m">
                <div class="text-bold mb-s">Đơn hàng #${order.id}</div>
                <div class="color-brand text-bold mb-m">${itemsNames || "Yêu cầu dịch vụ"}</div>
                <div class="stepper-wrapper">
                    ${renderStepper(order.status)}
                </div>
            </div>`;
    }).join("");
}