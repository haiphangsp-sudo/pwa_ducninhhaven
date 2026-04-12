import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";
import { getLocationInfo, getAnchorDisplay } from "./placesQuery.js";
import { addOrderToTracking } from "./orders.js";
import { updateCartQuantity } from "./action.js";
import { translate } from "../ui/utils/translate.js";


export function addToCart() {
  const itemId = getState().order?.line;
  if (!itemId) return;

  updateCartQuantity(itemId, 1);
}

function getRawItems(state, action) {
  if (action === "send_cart") {
    return state.cart?.items || [];
  }

  const line = state.order?.line;
  return line ? [{ id: line, qty: 1 }] : [];
}

function normalizeItems(rawItems) {
  return rawItems
    .map(({ id, qty = 1 }) => {
      const info = getVariantById(id);
      if (!info) return null;

      const quantity = Number(qty || 1);
      const price = Number(info.price || 0);

      return {
        id,
        qty: quantity,
        price,
        subtotal: quantity * price,

        // GIỮ cho GAS / Sheets
        item: info.productLabel || "",
        option: info.variantLabel || "",

        // GIỮ cho tracking đa ngôn ngữ / fallback
        itemLabel: info.productLabel || "",
        optionLabel: info.variantLabel || "",
        categoryKey: info.categoryKey || "",
        productKey: info.productKey || "",
        variantKey: info.variantKey || ""
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

function getOrderType(action) {
  return action === "send_cart" ? "cart" : "instant";
}

function buildPayload(state, action) {
  const { placeId, mode } = getLocationInfo();
  if (!placeId) return null;

  const items = normalizeItems(getRawItems(state, action));
  if (!items.length) return null;

  const { totalQty, totalPrice } = getTotals(items);
  const timestamp = new Date().toISOString();
  //const placeName = state.places?.data?.index?.[placeId]?.label || "";
  const placeName = getAnchorDisplay(state);

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: getOrderType(action),
    status: "NEW",
    timestamp,

    place: placeId,
    placeId,
    placeLabel: translate(placeName),

    mode,
    totalQty,
    totalPrice,
    items,
    device: navigator.userAgent
  };
}

function setOrderStatus(status) {
  const state = getState();

  const next = {
    order: {
      ...state.order,
      status
    }
  };

  if (status === "success" || status === "duplicate") {
    next.cart = {
      ...state.cart,
      items: []
    };
  }

  setState(next);
}

export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);

  if (!payload) return false;

  setOrderStatus("sending");

  try {
    const res = await sendRequest(payload);

    if (res?.duplicate) {
      setOrderStatus("duplicate");
      return true;
    }

    if (!res?.success) {
      throw new Error(res?.message || "API_FAIL");
    }

    setOrderStatus("success");

    try {
      addOrderToTracking(payload);
    } catch (error) {
      console.error("addOrderToTracking failed:", error);
    }

    return true;
  } catch (error) {
    console.error("submitOrder failed:", error);
    setOrderStatus("error");
    return false;
  }
}