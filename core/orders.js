// core/orders.js
import { getState, setState } from './state.js';
import { CONFIG } from '../config.js';
import { renderStatusBar } from '../ui/render/renderStatusBar.js';
import { openOrderTracker } from '../ui/components/orderTracker.js';



/* ---------- CONSTANTS ---------- */

const SCRIPT_URL = CONFIG.API_ENDPOINT;

/* ---------- PUBLIC ---------- */


export function startPollingOrders() {
    setInterval(async () => {
        const { active } = getState().orders;
        
        // CHỈ LỌC các đơn hàng chưa hoàn thành (Done hoặc Cancelled)
        const pendingIds = active
            .filter(order => order.status !== 'done' && order.status !== 'cancelled')
            .map(order => order.id);

        if (pendingIds.length === 0) return; // Không có đơn nào đang chờ thì nghỉ

        // Gửi danh sách ID này lên Google Script
        const updates = await fetchOrderUpdates(pendingIds);
        
        if (updates) {
            updateOrderStates(updates);
        }
    }, 30000); // 30 giây 
}



export async function syncOrdersWithServer() {
    // 1. Lấy danh sách ID cần kiểm tra từ localStorage
    const savedIds = JSON.parse(localStorage.getItem("haven_active_order_ids") || "[]");
    if (savedIds.length === 0) return;

    try {
        // 2. Gửi yêu cầu lên Google Apps Script (Sử dụng tham số ?ids=...)
        const response = await fetch(`${SCRIPT_URL}?action=getStatuses&ids=${savedIds.join(",")}`);
        const updates = await response.json(); 

        // updates sẽ có dạng: { "ORD001": "cooking", "ORD002": "done" }
        
        // 3. Cập nhật State
        const currentOrders = getState().orders.active;
        const updatedOrders = currentOrders.map(order => {
            if (updates[order.id]) {
                return { ...order, status: updates[order.id] };
            }
            return order;
        });

        // 4. Lọc bỏ các đơn đã 'done' quá lâu (ví dụ sau 10 phút)
        // Hoặc đơn giản là cập nhật lại toàn bộ
        setState({ orders: { active: updatedOrders } });

    } catch (error) {
        console.error("Không thể đồng bộ đơn hàng:", error);
    }
}


export function clearCompletedOrders() {
    const { active } = getState().orders;
    
    // 1. Lọc: Chỉ giữ lại những đơn CHƯA HOÀN TẤT
    const stillActive = active.filter(order => order.status !== 'DONE');
    
    // 2. Cập nhật State
    setState({ orders: { active: stillActive } });
    
    // 3. Cập nhật localStorage để đồng bộ ID
    const activeIds = stillActive.map(o => o.id);
    localStorage.setItem("haven_active_order_ids", JSON.stringify(activeIds));
    
    // 4. Vẽ lại giao diện
    renderStatusBar();
    openOrderTracker(); // Để cập nhật lại danh sách đang xem
}