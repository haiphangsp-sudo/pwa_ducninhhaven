// services/orderService.js
import { getState, setState } from "../core/state.js";

/**
 * Gửi đơn hàng "Đặt ngay" lên hệ thống
 */
export async function sendInstantOrder(orderData) {
    const state = getState();
    const { active } = state.context; // Lấy vị trí (Olive, Juniper...)

    // 1. Chuẩn bị "Gói tin" gửi đi
    const payload = {
        action: "place_order",
        placeId: active?.id || "Unknown",
        items: [{
            id: orderData.item,
            category: orderData.category,
            option: orderData.option,
            qty: orderData.qty || 1
        }],
        timestamp: Date.now()
    };

    try {
        // 2. Gửi qua Fetch API (Đến URL Vercel/Google Script của bạn)
        const response = await fetch("YOUR_API_ENDPOINT_URL", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const result = await response.json();

        // 3. Cập nhật State để UI (StatusBar) hiển thị đơn hàng mới
        const currentOrders = state.orders.active || [];
        setState({ 
            orders: { 
                active: [...currentOrders, { ...payload, status: 'NEW', id: result.orderId }] 
            } 
        });

        return { success: true };
    } catch (error) {
        console.error("Haven Order Error:", error);
        return { success: false, error };
    }
}