// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";
import { getState } from "../../core/state.js";
import { translate } from "../utils/translate.js";

export function openOrderTracker() {
    const state = getState();
    const active = state.orders?.active || []; // Chặn lỗi nếu state.orders chưa init
    
    const listContainer = document.getElementById("orderTrackerList");

    // 2. Kiểm tra nếu không có đơn (Chặn lỗi map trên mảng rỗng)
    if (active.length === 0) {
        listContainer.innerHTML = `
            <div class="p-xl center text-muted stack items-center gap-m">
                <div class="text-xxl">🍃</div>
                <div>${translate('order.no_active_order') || "Bạn chưa có đơn hàng nào."}</div>
            </div>`;
        return;
    }

    // 3. Render danh sách đơn hàng
    listContainer.innerHTML = active.map(order => {
        // CHỐT CHẶN: Nếu vì lý do nào đó order.items bị undefined
        const itemsList = order.items || [];
        const itemsNames = itemsList.map(i => i.item || i.name).join(", ");

        return `
            <div class="order-card p-m radius-m bg-white mb-m shadow-sm border">
                <div class="row justify-between items-center mb-s">
                    <span class="text-bold text-s opacity-70">#${order.id}</span>
                    <span class="text-xs text-muted">${order.time || ''}</span>
                </div>
                
                <div class="order-items-summary mb-m text-m color-brand text-bold">
                    ${itemsNames || "Yêu cầu dịch vụ"}
                </div>
                
                <div class="stepper-container">
                    ${renderStepper(order.status)}
                </div>
            </div>
        `;
    }).join("");
}