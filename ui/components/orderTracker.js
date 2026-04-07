// ui/components/orderTracker.js
import { renderStepper } from "../render/renderStepper.js";
import { translate } from "../utils/translate.js";
import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

export function openOrderTracker(state) {
    const active = state.orders?.active || [];
    const lang = state.lang?.current || 'vi';
    
    const trackerPage = document.getElementById("orderTrackerPage");
    const listContainer = document.getElementById("orderTrackerList");

    if (!trackerPage || !listContainer) {
        console.error("Không tìm thấy Element orderTrackerPage!");
        return;
    }

    // 1. CHỐT CHẶN: Nếu không có đơn hàng nào
    if (active.length === 0) {
        listContainer.innerHTML = `
            <div class="p-xl center text-muted stack items-center gap-m" style="margin-top: 40px;">
                <div class="text-xxl">🍃</div>
                <div>${translate('order.no_active_order') || "Bạn chưa có đơn hàng nào đang xử lý."}</div>
            </div>`;
        return;
    }

    // 2. RENDER danh sách đơn hàng
    listContainer.innerHTML = active.map(order => {
        // Xử lý nếu items bị lưu dưới dạng chuỗi JSON từ Google Sheets
        let itemsList = [];
        try {
            itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        } catch (e) {
            itemsList = [];
        }

        const itemsNames = itemsList.length > 0 
            ? itemsList.map(i => `${i.qty}x ${i.item || i.name}`).join(", ")
            : "Yêu cầu dịch vụ";

        const statusKey = order.status || "NEW";
        const statusMsg = STRINGS.status[`msg_${statusKey}`]?.[lang] || "";

        return `
            <div class="order-card p-m radius-m bg-white mb-m shadow-sm border">
                <div class="row justify-between items-center mb-s">
                    <span class="text-bold text-s opacity-70">#${order.id}</span>
                    <span class="status-badge is-${statusKey.toLowerCase()}">${statusKey}</span>
                </div>
                
                <div class="order-items-summary mb-m text-m color-brand text-bold">
                    ${itemsNames}
                </div>
                
                <div class="status-message-small mb-s text-xs opacity-80">
                    ${statusMsg}
                </div>

                <div class="stepper-container">
                    ${renderStepper(statusKey)}
                </div>
            </div>`;
    }).join("");
}