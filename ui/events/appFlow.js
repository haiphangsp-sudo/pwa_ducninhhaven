// ui/events/appFlow.js
import { getState } from "../../core/state.js";
import { syncOrdersWithServer, hydrateOrdersFromStorage, markSyncingAgedOrders } from "../../core/orders.js";

let orderPollingInterval = null;
const POLLING_TIME = 20000; // 25 giây

/**
 * KHỞI CHẠY TOÀN BỘ HỆ THỐNG
 * Gọi hàm này 1 lần duy nhất khi App bắt đầu (ví dụ trong main.js)
 */
export function bootstrapOrderTracker() {
  hydrateOrdersFromStorage();
  startOrderPolling();
  setupVisibilityListener();
}
/**
 * TRÌNH QUẢN LÝ TRUY VẤN (POLLING)
 */

export function startOrderPolling() {
  if (orderPollingInterval) return;

  // Kiểm tra xem có đơn nào cần theo dõi không mới chạy
  const state = getState();
  const activeOrders = state.orders?.active || [];
  const hasActive = activeOrders.some(o => !["DONE", "CANCELED"].includes(o.status));

  if (hasActive) {
    runSyncCycle();
    orderPollingInterval = setInterval(runSyncCycle, POLLING_TIME);
  }
}

function stopOrderPolling() {
  if (orderPollingInterval) {
    clearInterval(orderPollingInterval);
    orderPollingInterval = null;
  }
}

/**
 * CHU KỲ ĐỒNG BỘ CHI TIẾT
 */
async function runSyncCycle() {
  const state = getState();
  const activeOrders = state.orders?.active || [];
  
  // Kiểm tra xem có đơn hàng nào cần theo dõi không
  const hasActive = activeOrders.some(o => !["DONE", "CANCELED"].includes(o.status));

  if (hasActive) {
    await syncOrdersWithServer();
    markSyncingAgedOrders();
  } else {
    stopOrderPolling();
  }
}

/**
 * QUẢN LÝ TRẠNG THÁI TRÌNH DUYỆT (Tiết kiệm pin/data)
 */
function setupVisibilityListener() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopOrderPolling();
    } else {
      // Khi khách quay lại, kiểm tra xem có đơn hàng không để chạy lại polling
      const hasOrders = (getState().orders?.active || []).length > 0;
      if (hasOrders) startOrderPolling();
    }
  });
}