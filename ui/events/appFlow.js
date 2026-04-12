// ui/events/appFlow.js
import { getState } from "../../core/state.js";
import { 
  syncOrdersWithServer, 
  markSyncingAgedOrders, 
  clearCompletedOrders, 
  hydrateOrdersFromStorage 
} from "../../core/orders.js";

let orderPollingInterval = null;
const POLLING_TIME = 25000; // 25 giây

/**
 * KHỞI CHẠY TOÀN BỘ HỆ THỐNG
 * Gọi hàm này 1 lần duy nhất khi App bắt đầu (ví dụ trong main.js)
 */
export function bootstrapOrderTracker() {
  const state = getState();
  // 1. Khôi phục ID từ bộ nhớ (Hydrate)
  hydrateOrdersFromStorage(state);

  // 2. Dọn dẹp rác từ hôm trước (Clear)
  clearCompletedOrders(state);

  // 3. Bắt đầu theo dõi tự động (Polling)
  startOrderPolling(state);

  // 4. Lắng nghe sự kiện ẩn/hiện tab trình duyệt
  setupVisibilityListener();
}

/**
 * TRÌNH QUẢN LÝ TRUY VẤN (POLLING)
 */
function startOrderPolling() {
  if (orderPollingInterval) return;

  // Chạy ngay lập tức lần đầu
  runSyncCycle();

  orderPollingInterval = setInterval(runSyncCycle, POLLING_TIME);
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
    // A. Quét lỗi "Đồng bộ vô tận" trước (Watchdog)
    markSyncingAgedOrders(state);
    
    // B. Sau đó mới gọi Server
    await syncOrdersWithServer(state);
  } else {
    // Nếu không còn đơn nào, tạm nghỉ để tiết kiệm tài nguyên
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