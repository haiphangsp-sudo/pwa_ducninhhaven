// core/events.js

import { getState, setState } from "./state.js";
import { getItemById } from "./menuQuery.js";
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
    const info = getItemById(item.id);
    const name = info.parentName ? `${info.parentName} (${info.name})` : info.name;
    return `${item.qty}x ${name}`;
  }).join(", ");

  const total = items.reduce((sum, item) => {
    const info = getItemById(item.id);
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
export function updateCartQuantity(itemId, delta) {
  const state = getState();
  let items = [...(state.cart.items || [])];

  const idx = items.findIndex(i => i.id === itemId);
  if (idx === -1) return;

  items[idx].qty += delta;

  // Nếu số lượng về 0 thì xóa khỏi giỏ
  if (items[idx].qty <= 0) {
    items = items.filter(i => i.id !== itemId);
  }
}

/**
 * Thêm món vào giỏ hàng
 */
export function addToCart(itemId) {
  const state = getState();
  const items = [...(state.cart.items || [])];
  
  const existing = items.find(i => i.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({ id: itemId, qty: 1 });
  }

  setState({ 
    cart: { items },
    ack: { state: "show", status: "added" } 
  });

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
 * FINAL ACTION: Dọn dẹp UI sau khi đơn hàng thành công
 * Dùng cho cả gửi trực tiếp và gửi bù từ Queue
 */
// core/events.js
import { setState } from "./state.js";

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