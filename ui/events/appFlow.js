// ui/events/appFlow.js
import { getState } from "../../core/state.js";
import { syncOrdersWithServer } from "../../core/orders.js";

let orderPollingInterval = null;
const POLLING_TIME = 25000; // 25 giây - Khoảng cách an toàn cho Google Script

/**
 * Bắt đầu truy vấn trạng thái đơn hàng
 */
export function startOrderPolling() {
  // 1. Chống lặp: Nếu đang chạy rồi thì không tạo thêm interval mới
  if (orderPollingInterval) return;
  // 2. Chạy ngay lần đầu tiên để cập nhật dữ liệu mới nhất
  syncOrdersWithServer();

  // 3. Thiết lập vòng lặp
  orderPollingInterval = setInterval(() => {
    const state = getState();
    const activeOrders = state.orders?.active || [];
    
    // Kiểm tra xem có đơn hàng nào cần theo dõi không (không phải DONE/CANCELED)
    const hasActive = activeOrders.some(o => !["DONE", "CANCELED"].includes(o.status));

    if (hasActive) {
      syncOrdersWithServer();
    } else {
      // Nếu không còn đơn nào đang xử lý, tự động dừng để tiết kiệm tài nguyên
      stopOrderPolling();
    }
  }, POLLING_TIME);
}

/**
 * Dừng truy vấn trạng thái đơn hàng
 */
export function stopOrderPolling() {
  if (orderPollingInterval) {
    clearInterval(orderPollingInterval);
    orderPollingInterval = null;
    console.log("💤 Đã tạm dừng cập nhật trạng thái.");
  }
}