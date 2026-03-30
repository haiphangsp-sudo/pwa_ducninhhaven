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
function buildPayload(state, action) {
  const activePlace = state.context?.active;
  const placeId = activePlace?.id?.toLowerCase();

  if (!placeId) {
    showAck("error", translate("place.select"), 2000);
    return null;
  }

  // Lấy danh sách món từ giỏ hoặc từ lệnh mua ngay
  const rawItems = action === "send-cart" 
    ? (state.cart?.items || []) 
    : (state.order?.line ? [{ id: state.order.line, qty: 1 }] : []);

  if (rawItems.length === 0) return null;

  // Chuẩn bị mảng items. Mỗi item này sẽ trở thành một dòng trong Sheets
  const items = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    // Vẫn gửi subtotal của từng món để GAS có thể kiểm tra chéo nếu cần
    const price = Number(info.price || 0);
    const subtotal = price * cartItem.qty;

    return {
      id: cartItem.id,                     // Cột F (option_id)
      category: info.categoryKey || "",    // Cột G
      item: info.productLabel,  // Cột H
      option: info.variantLabel,// Cột I
      qty: Number(cartItem.qty),           // Cột J
      price: price,                        // Cột K
      subtotal: subtotal                   // Cột L
    };
  }).filter(Boolean);

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // ID đơn hàng (Cột A)
    type: action === "send-cart" ? "cart" : "instant",         // Cột O
    timestamp: new Date().toISOString(),                       // Cột C (client_time)
    mode: state.context?.anchor?.type || "web",                // Cột D
    place: placeId,                                            // Cột E
    device: navigator.userAgent,                               // Cột P
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

export function finalizeOrderSuccess(action) {
  const patch = {
    overlay: { view: null },
    order: { action: null, line: null, status: "idle", msg: "", at: Date.now() }
  };

  if (action === "send-cart") {
    patch.cart = { items: [] }; // Reset giỏ hàng sau khi gửi thành công
  }

  setState(patch);
  showAck("success", translate("cart_bar.success"), 2500);
  
  if (navigator.vibrate) navigator.vibrate(50);
}