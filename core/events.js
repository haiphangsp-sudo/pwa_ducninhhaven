// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById, getDrawerExtended } from "./menuQuery.js";
import { getLocationInfo } from "./placesQuery.js";
import { notifyResponse, finalizeOrderSuccess, updateCartQuantity} from "./action.js"
import { showToast } from "../ui/render/renderAck.js";


export function addToCart(e) {
  const state = getState();
  const itemId = state.order?.line;
  if (!itemId) return;
  
  updateCartQuantity(itemId, 1);
  showToast({ type: "success", message: "cart_bar.added" });
}


const getSourceItems = (state, action) => {
  if (action === "send_cart") return state.cart?.items || [];
  if (state.order?.line) return [{ id: state.order.line, qty: 1 }];
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
  const { placeName, placeId, mode } = getLocationInfo();
  if (!placeId) return null;

  const rawItems = getSourceItems(state, action);
  if (rawItems.length === 0) return null;

  const formattedItems = formatItemsForGAS(rawItems);
  if (formattedItems.length === 0) return null;
  const {totalQtyFormat,totalPrice} = getDrawerExtended();

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: action,
    timestamp: new Date().toISOString(),
    place: placeId,
    placeLabel: placeName,
    mode: mode,
    totalQty: totalQtyFormat,
    totalPrice: totalPrice,
    items: formattedItems,
    device: navigator.userAgent
  };
}
export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);
  
  if (!payload) return false;

  // Cập nhật UI sang trạng thái gửi
  setState({ order: { status: "sending" } });
  showToast({ type: "sending", message:"cart_bar.sending"});
  try {
    const res = await sendRequest(payload);
    if (res?.success) {
      finalizeOrderSuccess(action,payload);
      notifyResponse(res, payload);
      showToast({ type: "success", message: "cart_bar.success", duration: 3000 });
      return true;
    }
    throw new Error("API_FAIL");
  } catch (error) {
      setState({ order: { status: "error" } });
      showToast({type: "error", message: "cart_bar.error", duration: 2500});
      notifyResponse(error, payload);
    return false;
  } finally {
      setState({ ui: { isOrdering: false } });
  }
}

