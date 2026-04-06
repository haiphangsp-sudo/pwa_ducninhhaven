// core/action.js
import { getState, setState } from "./state.js";
import { showToast } from "../ui/render/renderAck.js"; 


export async function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  // Nếu không tìm thấy và delta <= 0 thì thoát luôn
  if (idx === -1 && delta <= 0) return;

  let nextItems = items;

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;

    if (nextQty <= 0) {
      // XỬ LÝ ANIMATION KHI XÓA MÓN
      const element = document.querySelector(`.drawer__item[data-id="${itemId}"]`);
      if (element) {
        element.classList.add("item-exit");
        // Đợi animation (ví dụ 400ms) để khách thấy món ăn biến mất mượt mà
        await new Promise(res => setTimeout(res, 400));
      }
      // Lọc bỏ món ăn ra khỏi danh sách
      nextItems = items.filter((_, i) => i !== idx);
    } else {
      // Cập nhật số lượng
      nextItems[idx] = { ...items[idx], qty: nextQty };
    }
  } else {
    // Thêm món mới vào giỏ
    nextItems.push({ id: itemId, qty: delta });
  }

  // CHỈ GỌI SETSTATE MỘT LẦN DUY NHẤT Ở ĐÂY
  setState({ 
    cart: { 
      ...state.cart, 
      items: nextItems, 
      status: "modified",
      at: Date.now() // Kích hoạt syncUI
    }
  });
}

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



/**
 * FINAL ACTION: Dọn dẹp và thông báo sau khi đơn hàng thành công
 * @param {string} type - Loại đơn ('cart', 'instant', 'recovery')
 */
export function finalizeOrderSuccess(type) {
  // 1. Bản đồ thông báo theo loại đơn hàng
  const feedbackMap = {
    send_cart: { title: "Thành công", msg: "Giỏ hàng của bạn đã được gửi tới bếp!" },
    buy_now: { title: "Đã gửi đơn", msg: "Món ăn đang được chuẩn bị, xin chờ giây lát!" },
    recovery: { title: "Đã phục hồi", msg: "Các đơn hàng cũ đã được gửi bù thành công!" }
  };

  const feedback = feedbackMap[type] || feedbackMap.cart;

  // 2. Chuẩn bị bản cập nhật State
  const patch = {
    ack: { 
      visible: true, 
      status: "success",
      title: feedback.title,
      message: feedback.msg
    },
    overlay: { view: null } // Đóng mọi cửa sổ (Drawer/Picker)
  };

  // 3. Chỉ xóa giỏ hàng nếu là đơn từ giỏ
  if (type === "send_cart") {
    patch.cart = { items: [], status: 'idle' };
  }

  // Thực thi cập nhật State
  setState(patch);

  // 4. Tự động ẩn thông báo sau 3.5 giây
  setTimeout(() => {
    setState({ ack: { state: "hidden" } });
  }, 3500);
}
export function onOrderSuccess(orderId, items) {
  // Chỉ xóa giỏ hàng nếu đó là đơn hàng gửi từ giỏ (CART)
  // Bạn có thể thêm logic check type ở đây nếu cần
  
  // Cập nhật StatusBar
  const newOrder = {
    id: orderId,
    status: 'pending',
    items: items,
    time: new Date().toISOString()
  };
  
  const currentOrders = getState().orders?.active || [];
  setState({ orders: { active: [newOrder, ...currentOrders] } });
}