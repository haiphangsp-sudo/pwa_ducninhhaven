// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";
import { translate } from "../ui/utils/translate.js";
import { getActivePlaceId, getActivePlaceType } from "../core/context.js";



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

const getSourceItems = (state, action) => {
  if (action === "send-cart") return state.cart?.items || [];
  if (state.order?.line) return [{ id: state.order.line, qty: 1 }];
  console.error("❌ Không tìm thấy nguồn món ăn cho action:", action);
  return [];
};
const formatItemsForGAS = (rawItems) => {
  return rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;
    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: info.productLabel,
      option: info.variantLabel,
      qty: Number(cartItem.qty || 1),
      price: Number(info.price || 0),
      subtotal: Number(info.price || 0) * Number(cartItem.qty || 1)
    };
  }).filter(Boolean);
};
function buildPayload(state, action) {
  const placeId = getActivePlaceId();
  const placeType = getActivePlaceType()
  if (!placeId) return null;

  const rawItems = getSourceItems(state, action);
  if (rawItems.length === 0) return null;

  const formattedItems = formatItemsForGAS(rawItems);
  if (formattedItems.length === 0) return null;

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: action,
    timestamp: new Date().toISOString(),
    place: placeId,
    mode: placeType,
    items: formattedItems,
    device: navigator.userAgent
  };
}
export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);
  
  if (!payload) return false;

  // Cập nhật UI sang trạng thái gửi
  setState({ order: { ...state.order, status: "pending" } });
  showAck("sending", translate("cart_bar.sending"), 0);

  try {
    const res = await sendRequest(payload);
    if (res?.success) {
      finalizeOrderSuccess(action);
      return true;
    }
    throw new Error("API_FAIL");
  } catch (err) {
    setState({ order: { ...getState().order, status: "error" } });
    showAck("error", translate("cart_bar.error"), 2500);
    return false;
  }
}

