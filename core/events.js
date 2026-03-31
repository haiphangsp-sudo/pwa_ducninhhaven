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
  // 1. Kiểm tra Vị trí (Bắt buộc)
  const activePlace = state.context?.active;
  const placeId = activePlace?.id?.toLowerCase();

  if (!placeId) {
    console.error("❌ [BuildPayload] Lỗi: Chưa chọn Phòng/Bàn");
    showAck("error", "Vui lòng chọn số phòng", 2000);
    return null; 
  }

  // 2. Xác định nguồn món ăn
  let rawItems = [];
  
  if (action === "send-cart") {
    rawItems = state.cart?.items || [];
    if (rawItems.length === 0) {
      console.error("❌ [BuildPayload] Lỗi: Giỏ hàng đang trống");
      return null;
    }
  } else if (action === "buy-now") {
    // Lấy món trực tiếp từ line mà người dùng vừa bấm
    const lineId = state.order?.line;
    if (!lineId) {
      console.error("❌ [BuildPayload] Lỗi: Mua ngay nhưng không có ID món (line)");
      return null;
    }
    rawItems = [{ id: lineId, qty: 1 }];
  }

  // 3. Chuyển đổi sang định dạng gửi cho GAS
  const items = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) {
      console.warn(`⚠️ Bỏ qua món ID ${cartItem.id} không tìm thấy trong menu`);
      return null;
    }
    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: translate(info.productLabel),
      option: translate(info.variantLabel),
      qty: Number(cartItem.qty || 1),
      price: Number(info.price || 0),
      subtotal: Number(info.price || 0) * Number(cartItem.qty || 1)
    };
  }).filter(Boolean);

  if (items.length === 0) {
    console.error("❌ [BuildPayload] Lỗi: Không có dữ liệu món ăn hợp lệ");
    return null;
  }

  // 4. Trả về payload chuẩn cho GAS
  return {
    id: `H-${Date.now()}`,
    type: action,
    timestamp: new Date().toISOString(),
    place: placeId,
    items: items,
    device: navigator.userAgent
  };
}

// Sửa lại submitOrder để trả về kết quả rõ ràng
export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);
  
  if (!payload) {
    console.log("🚫 Hủy gửi đơn do dữ liệu null");
    return false; // Trả về false để sync.js biết mà mở khóa
  }

  setState({ order: { ...state.order, status: "pending" } });
  showAck("sending", "Đang gửi đơn...", 0);

  try {
    const res = await sendRequest(payload);
    if (res?.success) {
      finalizeOrderSuccess(action);
      return true;
    }
    throw new Error(res?.message || "GAS_Error");
  } catch (err) {
    console.error("🔥 Lỗi API:", err);
    setState({ order: { ...getState().order, status: "error" } });
    showAck("error", "Gửi đơn thất bại", 2500);
    return false;
  }
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