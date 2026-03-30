// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";
import { translate } from "../ui/utils/translate.js";

/* ========================================================
   1. UI FEEDBACK HELPERS
   ======================================================== */

function showAck(status, message = "", timeout = 1800) {
  setState({
    ack: { state: "show", status, message }
  });

  if (timeout > 0) {
    setTimeout(() => {
      setState({
        ack: { state: "hidden", status: null, message: "" }
      });
    }, timeout);
  }
}

/* ========================================================
   2. DATA NORMALIZATION (Chuẩn hóa dữ liệu cho GAS)
   ======================================================== */

/**
 * Tạo Payload khớp hoàn toàn với hàm parseData trong GS_2.js
 */
function buildPayload(state, action) {
  const activePlace = state.context?.active;
  // GAS yêu cầu place phải thuộc VALID_PLACES (chữ thường)
  const placeId = activePlace?.id?.toLowerCase();

  if (!placeId) {
    showAck("error", translate("place.select"), 2000);
    return null;
  }

  // Xác định nguồn hàng: từ giỏ (cart) hoặc mua ngay (instant)
  const rawItems = action === "send-cart" 
    ? (state.cart?.items || []) 
    : (state.order?.line ? [{ id: state.order.line, qty: 1 }] : []);

  if (rawItems.length === 0) return null;

  let totalAmount = 0;

  // Xây dựng mảng items theo cấu trúc GAS mong đợi
  const items = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const subtotal = Number(info.price || 0) * cartItem.qty;
    totalAmount += subtotal;

    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: translate(info.productLabel), // Tên sản phẩm chính
      option: translate(info.variantLabel), // Loại (đá/nóng/tô lớn...)
      qty: Number(cartItem.qty),
      price: Number(info.price || 0)
    };
  }).filter(Boolean);

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // ID chống trùng
    type: action === "send-cart" ? "Cart" : "Instant",
    timestamp: new Date().toISOString(),
    mode: state.context?.anchor?.type || "web",
    place: placeId,
    device: navigator.userAgent,
    items: items
  };
}

/* ========================================================
   3. CART ACTIONS
   ======================================================== */

export function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;
    if (nextQty <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = { ...items[idx], qty: nextQty };
    }
  } else if (delta > 0) {
    items.push({ id: itemId, qty: delta });
  }

  setState({ cart: { items } });
}

export function addToCart() {
  const state = getState();
  const itemId = state.order?.line;
  if (!itemId) return;

  updateCartQuantity(itemId, 1);
  showAck("success", translate("cart_bar.added"), 1200);
}

/* ========================================================
   4. SEND ACTIONS (Gửi đơn hàng)
   ======================================================== */

export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);
  
  if (!payload) return false;

  // Cập nhật trạng thái chờ
  setState({ order: { ...state.order, status: "pending" } });
  showAck("sending", translate("cart_bar.sending"), 0);

  try {
    // api.js sẽ tự động đính kèm CONFIG.API_SECRET
    const res = await sendRequest(payload);

    if (res?.success) {
      finalizeOrderSuccess(action);
      return true;
    }
    throw new Error(res?.message || "failed");
  } catch (err) {
    setState({ order: { ...getState().order, status: "error" } });
    showAck("error", translate("cart_bar.error"), 2500);
    return false;
  }
}

export function finalizeOrderSuccess(action) {
  const patch = {
    overlay: { view: null },
    order: { action: null, line: null, status: "idle", msg: "", at: Date.now() }
  };

  if (action === "send-cart") {
    patch.cart = { items: [] }; // Xóa giỏ hàng khi gửi cả giỏ thành công
  }

  setState(patch);
  showAck("success", translate("cart_bar.success"), 2500);
  
  // Rung phản hồi nhẹ nếu thiết bị hỗ trợ
  if (navigator.vibrate) navigator.vibrate(50);
}

