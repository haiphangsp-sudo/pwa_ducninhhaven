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
  const activePlace = state.context?.active;
  const placeId = activePlace?.id?.toLowerCase();

  // CHẶN 1: Thiếu vị trí (Phòng/Bàn)
  if (!placeId) {
    console.error("❌ [Payload Error] Thiếu placeId. activePlace hiện tại:", activePlace);
    showAck("error", translate("place.select"), 2000);
    return null; 
  }

  // Xác định danh sách món dựa trên action
  let rawItems = [];
  if (action === "send-cart") {
    rawItems = state.cart?.items || [];
  } else if (action === "buy-now" || action === "instant") {
    // CHẶN 2: "Mua ngay" cần có ID món ở state.order.line
    const lineId = state.order?.line;
    if (!lineId) {
      console.error("❌ [Payload Error] Mua ngay nhưng state.order.line bị rỗng");
      return null;
    }
    rawItems = [{ id: lineId, qty: 1 }];
  }

  // CHẶN 3: Giỏ hàng trống
  if (rawItems.length === 0) {
    console.error("❌ [Payload Error] Không có món nào để gửi. Action:", action);
    return null;
  }

  // Chuyển đổi sang định dạng GAS
  const items = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) {
      console.warn("⚠️ Bỏ qua món không tìm thấy trong menu ID:", cartItem.id);
      return null;
    }
    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: translate(info.productLabel),
      option: translate(info.variantLabel),
      qty: Number(cartItem.qty || 0),
      price: Number(info.price || 0),
      subtotal: Number(info.price || 0) * Number(cartItem.qty || 0)
    };
  }).filter(Boolean);

  return {
    id: `H-${Date.now()}`,
    type: action,
    timestamp: new Date().toISOString(),
    place: placeId,
    items: items,
    device: navigator.userAgent
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
  console.log("📦 Dữ liệu gửi đi:", JSON.stringify(payload, null, 2)); // Thêm dòng này
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

// core/events.js

export function finalizeOrderSuccess(action) {
  // 1. Chuẩn bị thông báo
  const isCart = action === "send-cart";
  const message = isCart ? "Đơn hàng đã được gửi" : "Yêu cầu đã được gửi";

  // 2. Gộp tất cả thay đổi vào MỘT lần setState duy nhất
  const patch = {
    overlay: { view: null },
    order: { 
      action: null, 
      line: null, 
      status: "idle", 
      at: null 
    },
    // Gộp luôn phần hiển thị thông báo (Ack) vào đây
    ack: { 
      state: "show", 
      status: "success", 
      message: message 
    }
  };

  if (isCart) {
    patch.cart = { items: [] };
  }

  setState(patch);

  // 3. Chỉ dùng setTimeout để ẩn thông báo sau vài giây
  setTimeout(() => {
    setState({ ack: { state: "hidden", status: null, message: "" } });
  }, 2500);
}