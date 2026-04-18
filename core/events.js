// core/events.js

import { getState, setState } from "./state.js";
import { getVariantById } from "./menuQuery.js";
import { updateCartQuantity } from "./action.js";
import { getAnchorId, getLocationInfo } from "./placesQuery.js";
import { enqueue, undoLastQueuedOrder } from "./queue.js";
import { showToast } from "../ui/render/renderAck.js";

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
export async function processOrder(state, action) {
  if (getState().delivery?.state === "sending") {
    return { ok: false, reason: "already_sending" };
  }

  const payload = buildPayload(state, action);
  if (!payload) {
    return { ok: false, reason: "invalid_payload" };
  }

  const result = await enqueue(payload, {
    sourceAction: action,
    undoMs: action === "buy_now" ? 2500 : 3000
  });

  if (!result?.ok) {
    return { ok: false, reason: "enqueue_failed" };
  }
  showToast({
          type: "info",
          message: isBuyNow ? "Đã lưu yêu cầu" : "Đã lưu đơn từ giỏ",
          duration: result.undoMs,
          action: {
            label: "Hoàn tác",
            onClick: () => {
              const undoResult = undoLastQueuedOrder();

              if (undoResult?.ok) {
                showToast({
                  type: "info",
                  message: isBuyNow
                    ? "Đã thu hồi yêu cầu"
                    : "Đã thu hồi đơn từ giỏ",
                  duration: 2000
                });

                setState({
                  order: {
                    action: null,
                    line: null,
                    status: "idle",
                    at: null
                  }
                });
              }
            }
          }
        });

  return {
    ok: true,
    action,
    payload,
    undoMs: result.undoMs
  };
}