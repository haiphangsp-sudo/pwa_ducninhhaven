// core/orderEffects.js
import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";
import { getLocationInfo } from "./placesQuery.js";
import { updateCartQuantity, finalizeOrderSuccess, resetOrderCommand } from "./action.js";
import { showToast } from "../ui/render/renderAck.js";

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
    timestamp: new Date().toISOString(),
    place: placeId,
    placeLabel: placeName,
    mode: mode || "",
    totalQty,
    totalPrice,
    items: formattedItems,
    device: navigator.userAgent
  };
}

export async function runAddToCartEffect() {
  const state = getState();
  const itemId = state.order?.line;
  if (!itemId) {
    resetOrderCommand("error");
    return false;
  }

  await updateCartQuantity(itemId, 1);
  resetOrderCommand("idle");
  showToast({ type: "success", message: "cart_bar.added" });
  return true;
}

export async function runSubmitOrderEffect(action) {
  const state = getState();
  const payload = buildPayload(state, action);

  if (!payload) {
    resetOrderCommand("error");
    showToast({ type: "error", message: "cart_bar.error", duration: 2500 });
    return false;
  }

  setState({
    order: {
      status: "sending"
    }
  });

  try {
    const res = await sendRequest(payload);

    if (!res?.success) {
      throw new Error(res?.message || "API_FAIL");
    }

    finalizeOrderSuccess(action, payload);

    if (res.duplicate) {
      showToast({ type: "info", message: "cart_bar.duplicate", duration: 2500 });
    }

    return true;
  } catch (error) {
    resetOrderCommand("error");
    showToast({ type: "error", message: "cart_bar.error", duration: 2500 });
    return false;
  }
}