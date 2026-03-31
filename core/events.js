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
  // GỐC RỄ 4: Optional chaining toàn diện
  const activePlace = state.context?.active;
  const placeId = activePlace?.id?.toLowerCase();

  if (!placeId) {
    // Thông báo cho khách chọn vị trí nếu chưa có
    setState({ ack: { state: "show", status: "error", message: translate("place.select") } });
    return null;
  }

  const rawItems = action === "send-cart" 
    ? (state.cart?.items || []) 
    : (state.order?.line ? [{ id: state.order.line, qty: 1 }] : []);

  if (rawItems.length === 0) return null;

  const items = rawItems.map(cartItem => {
    if (!cartItem?.id) return null;
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const price = Number(info.price || 0);
    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: translate(info.productLabel),
      option: translate(info.variantLabel),
      qty: Number(cartItem.qty || 0),
      price: price,
      subtotal: price * Number(cartItem.qty || 0)
    };
  }).filter(Boolean);

  if (items.length === 0) return null;

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: action,
    place: placeId,
    timestamp: new Date().toISOString(),
    items: items
  };
}

/* ---------- CÁC HÀNH ĐỘNG ---------- */




// ... các hàm updateCartQuantity và addToCart giữ nguyên logic an toàn

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
  if (!payload) return;

  setState({ order: { ...state.order, status: "pending" } });

  try {
    const res = await sendRequest(payload);
    if (res?.success) {
      finalizeOrderSuccess(action);
    } else {
      throw new Error("send_failed");
    }
  } catch (err) {
    setState({ order: { ...getState().order, status: "error" } });
  }
}


export function finalizeOrderSuccess(action) {
  // GỐC RỄ 5: Reset 'at' về null và dọn dẹp action
  const patch = {
    overlay: { view: null },
    order: { 
      action: null, 
      line: null, 
      status: "idle", 
      at: null // Vô hiệu hóa 'at' cũ
    },
    ack: { state: "show", status: "success" }
  };

  if (action === "send-cart") {
    patch.cart = { items: [] };
  }

  setState(patch);
  
  // Tự động ẩn thông báo sau 2.5s
  setTimeout(() => {
    setState({ ack: { state: "hidden", status: null } });
  }, 2500);
}
