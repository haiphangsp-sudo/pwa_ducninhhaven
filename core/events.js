// core/events.js

import { getState, setState } from "./state.js";
import { getVariantById } from "./menuQuery.js";
import { sendRequest } from "../services/api.js";
import { CONFIG } from "../config.js";


/* ========================================================
   INTERNAL HELPERS (Không export)
   ======================================================== */

/**
 * Chuẩn hóa dữ liệu để gửi đi
 */
function buildPayload(items, state, type) {
  const placeId = state.context.active?.id || "N/A";

  const summary = items.map(item => {
    const info = getVariantById(item.id);
    const name = `${info.productLabel} - ${info.variantLabel}`;
    return `${item.qty}x ${name}`;
  }).join(", ");

  const total = items.reduce((sum, item) => {
    const info = getVariantById(item.id);
    return sum + (info.price * item.qty);
  }, 0);

  return {
    place: placeId,
    order_type: type === "instant" ? "Mua ngay" : "Giỏ hàng",
    details: summary,
    total_amount: total
  };
}

/* ========================================================
   PUBLIC ACTIONS (Export)
   ======================================================== */

/**
 * Cập nhật số lượng món trong giỏ (Dùng cho nút +/- trong Drawer)
 */
// core/events.js

export function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart.items || [])]; // Clone mảng để đảm bảo tính bất biến
  const idx = items.findIndex(i => i.id === itemId);

  if (idx > -1) {
    items[idx].qty += delta;
    if (items[idx].qty <= 0) items.splice(idx, 1);
  } else if (delta > 0) {
    // NẾU CHƯA CÓ VÀ DELTA > 0 THÌ MỚI THÊM VÀO
    items.push({ id: itemId, qty: delta });
  }

  setState({ cart: { items } });
}

/**
 * Thêm món vào giỏ hàng
 */
export function addToCart(itemId) {
  // Chỉ cần gọi hàm này, nó sẽ tự xử lý việc tăng qty hoặc push mới
  updateCartQuantity(itemId, 1);

  // Hiện thông báo phản hồi (Ack)
  setState({ ack: { state: "show", status: "success", message: "Đã thêm vào giỏ hàng"  } });
  setTimeout(() => setState({ ack: { state: "hidden" } }), 1500);
}


/**
 * Xử lý Mua ngay (Gửi 1 món)
 */
export async function buyNow(itemId) {
  const state = getState();
  setState({ ack: { state: "show", status: "sending" } });

  try {
    const payload = buildPayload([{ id: itemId, qty: 1 }], state, "instant");
    const res = await sendRequest(payload); // Gọi trực tiếp api.js

    if (res.success) {
      setState({ ack: { state: "show", status: "success" } });
      setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
    } else {
      throw new Error(res.message);
    }
  } catch (err) {
    setState({ ack: { state: "show", status: "error" } });
  }
}

/**
 * Xử lý Gửi toàn bộ giỏ hàng
 */
export async function sendCart() {
  const state = getState();
  const cartItems = state.cart.items || [];

  if (cartItems.length === 0) return;

  setState({ ack: { state: "show", status: "sending" } });

  try {
    const payload = buildPayload(cartItems, state, "cart");
    const res = await sendRequest(payload); // Xử lý kết quả trả về từ api.js

    if (res.success) {
      setState({
        cart: { items: [] }, // Xóa giỏ hàng khi thành công
        order: { type: null, line: null }, // Reset trạng thái order
        overlay: { view: null }, // Đóng overlay
        ack: { state: "show", status: "success" }
      });
      setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
    } else {
      throw new Error(res.message);
    }
  } catch (err) {
    setState({ ack: { state: "show", status: "error" } });
  }
}

/**
 * FINAL ACTION: Dọn dẹp và thông báo sau khi đơn hàng thành công
 * @param {string} type - Loại đơn ('cart', 'instant', 'recovery')
 */
export function finalizeOrderSuccess(type) {
  // 1. Bản đồ thông báo theo loại đơn hàng
  const feedbackMap = {
    cart: { title: "Thành công", msg: "Giỏ hàng của bạn đã được gửi tới bếp!" },
    instant: { title: "Đã gửi đơn", msg: "Món ăn đang được chuẩn bị, xin chờ giây lát!" },
    recovery: { title: "Đã phục hồi", msg: "Các đơn hàng cũ đã được gửi bù thành công!" }
  };

  const feedback = feedbackMap[type] || feedbackMap.cart;

  // 2. Chuẩn bị bản cập nhật State
  const patch = {
    ack: { 
      state: "show", 
      status: "success",
      title: feedback.title,
      message: feedback.msg
    },
    overlay: { view: null } // Đóng mọi cửa sổ (Drawer/Picker)
  };

  // 3. Chỉ xóa giỏ hàng nếu là đơn từ giỏ
  if (type === "cart" || type === "send_cart") {
    patch.cart = { items: [], status: 'idle' };
  }

  // Thực thi cập nhật State
  setState(patch);

  // 4. Tự động ẩn thông báo sau 3.5 giây
  setTimeout(() => {
    setState({ ack: { state: "hidden" } });
  }, 3500);
}
// ... các hàm handleSendCart, buyNow của bạn sẽ gọi finalizeOrderSuccess() khi thành công