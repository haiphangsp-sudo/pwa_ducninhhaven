// services/api.js
// Gửi request dạng JSON (tối ưu cho giỏ hàng và dữ liệu lồng nhau)

import { CONFIG } from "../config.js";
import { isOnline, fetchWithTimeout } from "./network.js";
import { markSuccess } from "./health.js";

/**
 * Gửi gói dữ liệu lên Google Apps Script
 * @param {Object} payload - Dữ liệu từ queue (bao gồm type, item, items, place...)
 */
export async function sendRequest(payload) {
  // 1. Kiểm tra kết nối mạng
  if (!isOnline()) {
    throw new Error("offline");
  }

  // 2. Chuẩn bị gói dữ liệu đầy đủ bao gồm mã bảo mật từ Config
  const fullPayload = {
    ...payload,
    secret: CONFIG.API_SECRET
  };

  let res;

  try {
    // 3. Thực hiện gọi API
    res = await fetchWithTimeout(
      CONFIG.API_ENDPOINT,
      {
        method: "POST",
        // Sử dụng text/plain để tránh kích hoạt CORS preflight (OPTIONS request) 
        // mà Google Apps Script đôi khi không xử lý tốt. 
        // Backend vẫn sẽ nhận và parse JSON bình thường.
        headers: {"Content-Type": "text/plain" },
        body: JSON.stringify(fullPayload)
      },
      8000 // Tăng timeout lên 8 giây cho các đơn hàng lớn
    );

  } catch (e) {
    throw new Error("network");
  }

  // 4. Kiểm tra phản hồi từ Server
  if (!res || !res.ok) {
    throw new Error("server");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("invalid_json");
  }

  // 5. Xử lý các trạng thái phản hồi đặc biệt từ Google Script
  if (data.status === "unauthorized") return { success: false, fatal: true, message: "Sai mã bí mật" };
  if (data.status === "invalid") return { success: false, fatal: true, message: "Dữ liệu không hợp lệ" };
  
  
  // Nếu server báo bận hoặc yêu cầu thử lại
  if (data.status === "retry") {
    throw new Error("retry");
  }

  // Ghi nhận gửi thành công để cập nhật hệ thống sức khỏe của App
  if (data.status === "ok") {
    markSuccess();
    return { success: true };
  }
  // Trả về toàn bộ dữ liệu (bao gồm status: "success" từ GS)
  return data;
}