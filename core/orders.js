// core/orders.js
import { getState, setState } from './state.js';
import { CONFIG } from '../config.js';

const SCRIPT_URL = CONFIG.API_ENDPOINT;
const STORAGE_KEY = "haven_active_order_ids";

/* =========================
   PUBLIC API (SERVICE)
========================= */

/**
 * Thêm một đơn hàng mới vào hệ thống theo dõi
 */
export function addOrderToTracking(orderId, items) {

    const newOrder = {
        id: orderId,
        status: 'NEW', // Khớp với nhãn trong Google Sheets
        items: items,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Cập nhật State
    const { active } = getState().orders;
    setState({ 
        orders: { 
            active: [...(active || []), newOrder] 
        } 
    });

    // 2. Cập nhật LocalStorage để lưu vết khi F5 trang
    const savedIds = _getSavedIds();
    if (!savedIds.includes(orderId)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedIds, orderId]));
    }
}

/**
 * Đồng bộ trạng thái từ Server về Client
 */
export async function syncOrdersWithServer() {
    const savedIds = _getSavedIds();
    if (savedIds.length === 0) return;

    try {
        // Gọi GAS lấy trạng thái mới nhất
        const response = await fetch(`${SCRIPT_URL}?action=getStatuses&ids=${savedIds.join(",")}`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const updates = await response.json(); 
        // updates format: { "ORD001": "COOKING", "ORD002": "DONE" }
        console.log("[Haven Sync] Dữ liệu từ Server:", updates);
        const { active } = getState().orders;
        let hasChanges = false;

        const updatedOrders = active.map(order => {
            const newStatus = updates[order.id];
            if (newStatus && order.status !== newStatus) {
                hasChanges = true;
                return { ...order, status: newStatus };
            }
            return order;
        });

        if (hasChanges) {
            setState({ orders: { active: updatedOrders } });
        }

    } catch (error) {
        console.error("Haven Service Error [Sync]:", error);
    }
}

/**
 * Dọn dẹp các đơn hàng đã hoàn tất (DONE) khỏi danh sách theo dõi
 */
// core/orders.js
export function clearCompletedOrders() {
    const { active } = getState().orders;
    
    // Xóa sạch các đơn "đầu cuối": Xong, Hoàn tất, hoặc Đã hủy
    const terminalStates = ['DONE', 'RECOVERING', 'CANCELED'];
    const stillActive = active.filter(order => !terminalStates.includes(order.status));
    
    setState({ orders: { active: stillActive } });
    
    const activeIds = stillActive.map(o => o.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeIds));
}

/* =========================
   PRIVATE HELPERS
========================= */

function _getSavedIds() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
        return [];
    }
}

export function hydrateOrdersFromStorage() {
    const savedIds = _getSavedIds();
    if (savedIds.length > 0) {
        // Nạp tạm các ID vào state với status là '...' hoặc 'SYNCING'
        const placeholderOrders = savedIds.map(id => ({ id, status: 'NEW', items: [] }));
        setState({ orders: { active: placeholderOrders } });
    }
}