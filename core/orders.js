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
        const response = await fetch(`${SCRIPT_URL}?action=getStatuses&ids=${savedIds.join(",")}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const updates = await response.json();
        console.log("[Haven Sync] Dữ liệu từ Server:", updates);

        const { active = [] } = getState().orders || {};

        // index nhanh theo id từ state hiện tại
        const activeMap = new Map(active.map(order => [order.id, order]));

        // dựng lại danh sách theo savedIds, không phụ thuộc active đang có hay không
        const rebuiltOrders = savedIds.map(id => {
            const existing = activeMap.get(id);

            return {
                id,
                status: updates[id] || existing?.status || "SYNCING",
                items: existing?.items || [],
                time: existing?.time || ""
            };
        });

        // bỏ các terminal state khỏi storage nếu muốn giữ sạch
        const terminalStates = ['DONE', 'RECOVERING', 'CANCELED'];
        const stillActive = rebuiltOrders.filter(order => !terminalStates.includes(order.status));

        setState({
            orders: {
                active: stillActive
            }
        });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(stillActive.map(order => order.id))
        );

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
    const savedIds = _getSavedIds(); // Lấy danh sách ID từ localStorage
    
    if (savedIds.length > 0) {
        // Tạo các đơn hàng "chờ" (placeholder) để UI biết là có đơn cần hiện
        const placeholderOrders = savedIds.map(id => ({
            id: id,
            status: 'SYNCING', // Trạng thái tạm thời khi đang đợi server
            items: []
        }));

        // Đẩy vào State ngay lập tức
        setState({ 
            orders: { 
                active: placeholderOrders,
                isBarExpanded: false // Hoặc lấy từ một key khác trong storage nếu muốn
            } 
        });
        
        return true;
    }
    return false;
}