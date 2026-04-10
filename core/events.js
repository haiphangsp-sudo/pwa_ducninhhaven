import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";
import { getLocationInfo } from "./placesQuery.js";
import { notifyResponse, finalizeOrderSuccess, updateCartQuantity } from "./action.js";

export function addToCart() {
  const state = getState();
  const itemId = state.order?.line;
  if (!itemId) return;
  updateCartQuantity(itemId, 1);
}

function getSourceItems(state, action) {
  if (action === "send_cart") return state.cart?.items || [];
  if (state.order?.line) return [{ id: state.order.line, qty: 1 }];
  return [];
}

function formatItemsForGAS(rawItems) {
  return rawItems
    .map(cartItem => {
      const info = getVariantById(cartItem.id);
      if (!info) return null;

      const qty = Number(cartItem.qty || 1);
      const price = Number(info.price || 0);

      return {
        id: cartItem.id,
        category: info.categoryKey || "",
        item: info.productLabel || "",
        option: info.variantLabel || "",
        qty,
        price,
        subtotal: qty * price
      };
    })
    .filter(Boolean);
}

function getTotals(items) {
  return items.reduce(
    (acc, item) => {
      acc.totalQty += Number(item.qty || 0);
      acc.totalPrice += Number(item.subtotal || 0);
      return acc;
    },
    { totalQty: 0, totalPrice: 0 }
  );
}

function buildPayload(state, action) {
  const { placeName, placeId, mode } = getLocationInfo();
  if (!placeId) return null;

  const rawItems = getSourceItems(state, action);
  if (rawItems.length === 0) return null;

  const formattedItems = formatItemsForGAS(rawItems);
  if (formattedItems.length === 0) return null;

  const { totalQty, totalPrice } = getTotals(formattedItems);

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: action,
    status: "NEW",
    timestamp: new Date().toISOString(),
    place: placeId,
    placeLabel: placeName,
    mode: mode,
    totalQty,
    totalPrice,
    items: formattedItems,
    device: navigator.userAgent
  };
}
export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);

  if (!payload) return false;

  setState({order: {status: "sending"}});
  try {
    const res = await sendRequest(payload);

    if (res?.success) {
      finalizeOrderSuccess(action, payload);
      notifyResponse(res);
      setState({order: {status: "success"}});
      
      return true;
    }
    if(res?.duplicate) {
      setState({order: {status: "duplicate"}});
      notifyResponse(res);
      return true;
    }
    if(res?.rate_limited) {
      setState({order: {status: "rate_limited"}});
      notifyResponse(res);
      return true;
    }

    throw new Error(res?.message || "API_FAIL");
  } catch (error) {
    setState({order: {status: "error"}});

    notifyResponse(error);
    return false;
  }
}