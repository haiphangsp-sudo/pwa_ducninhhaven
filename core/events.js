import { getState } from "./state.js";
import { getVariantById } from "./menuQuery.js";
import { updateCartQuantity } from "./action.js";
import { getAnchorId, getLocationInfo } from "./placesQuery.js";

/* =========================
   ACTION
========================= */

export function addToCart() {
  const itemId = getState().order?.line;
  if (!itemId) return;

  updateCartQuantity(itemId, 1);
}

/* =========================
   PAYLOAD BUILDER
========================= */

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

        item: info.objProLab?.["vi"] || "",
        option: info.objVarLab?.["vi"] || "",

        itemLabel: info.objProLab || "",
        optionLabel: info.objVarLab || "",
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

/* =========================
   MAIN BUILDER
========================= */

function buildPayload(state, action) {
  const items = normalizeItems(getRawItems(state, action));
  if (!items.length) return null;

  const { totalQty, totalPrice } = getTotals(items);
  const timestamp = new Date().toISOString();

  const { placeId, placeName, mode } = getLocationInfo();
  if (!placeId) return null;

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: getOrderType(action),
    status: "NEW",
    timestamp,

    placeId,
    placeLabel: placeName,
    anchorId: getAnchorId(),

    mode,
    totalQty,
    totalPrice,
    items,
    device: navigator.userAgent
  };
}

export function buildOrderPayload(state, action) {
  return buildPayload(state, action);
}