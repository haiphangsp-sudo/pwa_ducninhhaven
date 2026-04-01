// ui/notifications.js (hoặc đặt trong core/actions.js)

import { onOrderSuccess } from "../core/events.js";
// Giả định bạn có hàm showToast hoặc showOverlay để hiển thị thông báo
// import { showToast } from "./utils.js"; 

/**
 * Điều phối thông báo và hành động UI dựa trên kết quả gửi đơn
 * @param {Object|Error} response - Kết quả từ sendRequest hoặc Error bị catch
 * @param {Object} payload - Dữ liệu đơn hàng gốc (để lấy danh sách món)
 */
export function notifyResponse(response, payload) {
  
  // 1. XỬ LÝ KHI THÀNH CÔNG (success: true)
  if (response.success) {
    if (response.duplicate) {
      showToast("Đơn hàng này đã được gửi trước đó.", "info");
    } else {
      showToast("Đơn hàng đã được gửi thành công!", "success");
    }

    // Gọi hàm hậu mãi: xóa giỏ, lưu đơn vào StatusBar
    // Lưu ý: response.orderId nên được trả về từ server (GAS)
    onOrderSuccess(response.orderId || Date.now(), payload.items);
    return;
  }

  // 2. XỬ LÝ LỖI HỆ THỐNG (Fatal - Không nên thử lại ngay)
  if (response.fatal) {
    const fatalMessages = {
      unauthorized: "Lỗi xác thực: Secret key không chính xác.",
      invalid: "Dữ liệu đơn hàng không hợp lệ."
    };
    showToast(fatalMessages[response.message] || "Lỗi hệ thống nghiêm trọng.", "error");
    return;
  }

  // 3. XỬ LÝ CÁC LỖI THROW (Error Object - Có thể thử lại)
  // Lấy message từ Error object hoặc từ response.message
  const errorKey = response instanceof Error ? response.message : response.message;
  
  const errorMap = {
    offline: "Bạn đang ngoại tuyến. Vui lòng kiểm tra Wi-Fi/4G.",
    network: "Yêu cầu bị quá hạn (Timeout). Vui lòng thử lại.",
    server: "Máy chủ đang gặp sự cố. Hãy thử lại sau ít phút.",
    retry: "Hệ thống đang bận. Đang tự động xếp hàng gửi lại...",
    invalid_json: "Phản hồi từ máy chủ không hợp lệ."
  };

  showToast(errorMap[errorKey] || "Đã xảy ra lỗi không xác định.", "error");
}