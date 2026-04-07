// core/action.js
import { getState, setState } from "./state.js";
import { showToast } from "../ui/render/renderAck.js"; 
import { addOrderToTracking } from "./orders.js";


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

export function notifyResponse(response) {
  if (response.success) {
    if (response.duplicate) {
      showToast("Đơn hàng này đã được gửi trước đó.", "info");
    } else {
      showToast("Đơn hàng đã được gửi thành công!", "success");
    }
    return;
  }

  if (response.fatal) {
    const fatalMessages = {
      unauthorized: "Lỗi xác thực.",
      invalid: "Dữ liệu không hợp lệ."
    };
    showToast(fatalMessages[response.message] || "Lỗi hệ thống.", "error");
    return;
  }

  const errorKey = response instanceof Error ? response.message : response.message;

  const errorMap = {
    offline: "Bạn đang offline.",
    network: "Timeout.",
    server: "Server lỗi.",
    retry: "Đang thử lại...",
    invalid_json: "Response lỗi."
  };

  showToast(errorMap[errorKey] || "Lỗi không xác định.", "error");
}

/**
 * FINAL ACTION: Dọn dẹp và thông báo sau khi đơn hàng thành công
 * @param {string} type - Loại đơn ('cart', 'instant', 'recovery')
 */

export function finalizeOrderSuccess(type, payload) {
  const feedbackMap = {
    send_cart: { title: "Thành công", msg: "Giỏ hàng đã gửi!" },
    buy_now: { title: "Đã gửi", msg: "Đang chuẩn bị..." },
    recovery: { title: "Đã phục hồi", msg: "Đã gửi lại đơn cũ!" }
  };

  const feedback = feedbackMap[type] || feedbackMap.send_cart;

  // ✅ CHỈ 1 nơi add order
  if (payload?.id) {
    addOrderToTracking(payload.id, payload.items);
  }

  const patch = {
    ack: {
      visible: true,
      status: "success",
      title: feedback.title,
      message: feedback.msg
    },
    overlay: { view: null }
  };

  if (type === "send_cart") {
    patch.cart = { items: [], status: "idle" };
  }

  setState(patch);

  setTimeout(() => {
    setState({ ack: { visible: false } });
  }, 3500);
}