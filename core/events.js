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
 * Tạo Payload gửi đi. Đã lược bỏ tổng tiền toàn đơn 
 * vì GAS sẽ xử lý ghi từng món thành một dòng riêng biệt.
 */
// core/events.js

function buildPayload(state, action) {
  // Sử dụng Optional Chaining (?.) để an toàn
  const activePlace = state.context?.active;
  const placeId = activePlace?.id?.toLowerCase();

  // Nếu không có placeId, báo lỗi cho khách và dừng lại
  if (!placeId) {
    showAck("error", translate("place.select"), 2000);
    return null; 
  }

  const rawItems = action === "send-cart" 
    ? (state.cart?.items || []) 
    : (state.order?.line ? [{ id: state.order.line, qty: 1 }] : []);

  if (rawItems.length === 0) return null;

  // Lọc kỹ các món ăn
  const items = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null; // Bỏ qua món không tìm thấy trong menu

    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: translate(info.productLabel),
      option: translate(info.variantLabel),
      qty: Number(cartItem.qty),
      price: Number(info.price || 0),
      subtotal: Number(info.price || 0) * cartItem.qty
    };
  }).filter(Boolean); // Xóa bỏ các item null

  return {
    id: `H-${Date.now()}`,
    type: action,
    place: placeId,
    items: items
    // ... các thông tin khác
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
   4. SEND ACTIONS
   ======================================================== */

export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);
  
  if (!payload) return false;

  setState({ order: { ...state.order, status: "pending" } });
  showAck("sending", translate("cart_bar.sending"), 0);

  try {
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

// core/events.js
export function finalizeOrderSuccess(action) {
  const patch = {
    overlay: { view: null },
    order: { 
      action: null, 
      line: null, 
      status: "idle", 
      at: null // ĐƯA VỀ NULL để reset hoàn toàn
    }
  };

  if (action === "send-cart") {
    patch.cart = { items: [] };
  }

  setState(patch);
  showAck("success", translate("cart_bar.success"), 2500);
}