// core/action.js
import { getState, setState } from "./state.js";
import { showToast } from "../ui/render/renderAck.js";


export async function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  if (idx === -1 && delta <= 0) return;

  let nextItems = items;

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;

    if (nextQty <= 0) {
      const element = document.querySelector(`.drawer__item[data-id="${itemId}"]`);
      if (element) {
        element.classList.add("item-exit");
        await new Promise(res => setTimeout(res, 400));
      }
      nextItems = items.filter((_, i) => i !== idx);
    } else {
      nextItems[idx] = { ...items[idx], qty: nextQty };
    }
  } else {
    nextItems.push({ id: itemId, qty: delta });
  }

  setState({
    cart: {
      ...state.cart,
      items: nextItems,
      status: "modified",
      at: Date.now()
    }
  });
  
}

export function resetOrderCommand(status = "idle") {
  setState({
    order: {
      action: null,
      line: null,
      status,
      at: null
    }
  });
}

/**
 * Xử lý phản hồi từ Google Apps Script và cập nhật UI/State tương ứng
 * @param {Object} res - Kết quả trả về từ fetch (đã .json())
 * @param {Object} payload - Dữ liệu đơn hàng gốc đã gửi đi
 */
export function notifyResponse(res) {
    // 1. Trường hợp THÀNH CÔNG
    if (res.status === "ok" || res.status === "success") {
        // Gọi hàm để xóa giỏ hàng và hiện thanh trạng thái
        
        // Hiện thông báo thành công (Toast hoặc Alert)
        showToast("Đã gửi đơn thành công! Bếp đang chuẩn bị món cho bạn.", "success");
        return;
    }

    // 2. Trường hợp BỊ TRÙNG (Duplicate)
    if (res.status === "duplicate") {
        showToast("Đơn hàng này đã được gửi trước đó rồi nhé!", "warning");
        return;
    }

    // 3. Trường hợp QUÁ TẢI (Rate Limited)
    if (res.status === "rate_limited") {
        showToast("Bạn thao tác hơi nhanh, vui lòng đợi 5 giây rồi thử lại.", "info");
        return;
    }

    // 4. Trường hợp LỖI DỮ LIỆU hoặc BẢO MẬT
    if (res.status === "invalid" || res.status === "unauthorized") {
        console.error("Lỗi xác thực hệ thống:", res.message);
        showToast("Có lỗi kỹ thuật (Mã: Security). Vui lòng báo nhân viên.", "error");
        return;
    }

    // 5. Trường hợp LỖI HỆ THỐNG CHUNG
    showToast("Không thể gửi đơn. Vui lòng kiểm tra kết nối mạng.", "error");
}