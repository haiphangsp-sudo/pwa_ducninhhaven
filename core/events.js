// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { translate } from "../ui/utils/translate.js";
import { getVariantById } from "./menuQuery.js";


/* ========================================================
   INTERNAL HELPERS (Không export)
   ======================================================== */

/**
 * Chuẩn hóa dữ liệu để gửi đi
 */
function buildPayload(state,action) {
  const place = state?.context?.active?.type;
  const mode = state?.context?.anchor?.type;
  const cat = getCart(state,action);

  return {
    id: cat.id,
    type: cat.type,
    timestamp: new Date().toISOString(),
    mode: cat.mode,
    place: cat.place,
    device: navigator.userAgent,
    items: cat.items
  };
}

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
export function addToCart(state, action) {
  const itemId = state.order.line;
  if (!itemId) return;
  // Chỉ cần gọi hàm này, nó sẽ tự xử lý việc tăng qty hoặc push mới
  updateCartQuantity(itemId, 1);

  // Hiện thông báo phản hồi (Ack)
  setState({ ack: { state: "show", status: "success", message: "Đã thêm vào giỏ hàng"  } });
  setTimeout(() => setState({ ack: { state: "hidden" } }), 1500);
}


/**
 * Xử lý Mua ngay (Gửi 1 món)
 */
export async function buyNow(state,action) {
  setState({ ack: { state: "show", status: "sending" } });

  try {
    const payload = buildPayload(state, action);
    const res = await sendRequest(payload);

    if (res.success) {
      finalizeOrderSuccess(action);
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
export async function sendCart(state,action) {
  const cartItems = state.cart.items || [];

  if (cartItems.length === 0) return;

  setState({ ack: { state: "show", status: "sending" } });

  try {
    const payload = buildPayload(state,action);
    const res = await sendRequest(payload);

    if (res.success) {
      finalizeOrderSuccess(action);

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
// core/events.js

export function finalizeOrderSuccess(action) {
  const patch = {
    // 1. Hiện thông báo
    ack: { 
      state: "show", 
      status: "success",
      message: action === "send-cart" ? "Đơn hàng đã được gửi!" : "Yêu cầu đã được gửi!"
    },
    // 2. Đóng Overlay (Drawer/Picker)
    overlay: { view: null },
    // 3. Reset lệnh Order về ban đầu
    order: { action: null, line: null, status: "idle", at: null }
  };

  // 4. CHỐT HẠ: Nếu là đơn từ Giỏ hàng thì mới xóa sạch món
  if (action === "send-cart") {
    patch.cart = { items: [] };
  }

  setState(patch);
  
  // Tự ẩn thông báo sau 3s
  setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
}

function getCart(state,action) {
  if (action !== "send-cart" && action !== "instant") return null;
  const line = state.order.line;
  const type = action === "send-cart" ? "cart" : action;
  let rawItems = [];
  if (action === "send-cart") rawItems = state.cart?.items || [];
  if (action === "instant") {
    rawItems = line ? [{ id: line, qty: 1 }] : [];
  }

  if (rawItems.length === 0) return null;

  // 1. Chi tiết hóa từng món
  const detailedItems = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;
    return {
      id: cartItem.id,
      category: info.categoryKey,
      item: info.productLabel,
      option: info.variantLabel,
      qty: cartItem.qty,
      type:info.ui,
      price: info.price===null? 0 : info.priceFormat
    };
  }).filter(Boolean);

  return {
      id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mode: translate(state.context.anchor?.type) || "",
      place: translate(state.context.active?.type) || "",
      type: type,
      items: detailedItems 
  }
}