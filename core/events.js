// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";

/* ========================================================
   ACK HELPERS
======================================================== */

function showAck(status, message = "", timeout = 1800) {
  setState({
    ack: {
      state: "show",
      status,
      message
    }
  });

  if (timeout > 0) {
    setTimeout(() => {
      setState({
        ack: {
          state: "hidden",
          status: null,
          message: ""
        }
      });
    }, timeout);
  }
}

/* ========================================================
   CART HELPERS
======================================================== */

export function updateCartQuantity(itemId, delta) {
  if (!itemId || !Number.isFinite(delta) || delta === 0) return;

  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;

    if (nextQty <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = {
        ...items[idx],
        qty: nextQty
      };
    }
  } else if (delta > 0) {
    items.push({
      id: itemId,
      qty: delta
    });
  }

  setState({
    cart: { items }
  });
}

export function addToCart(state) {
  const itemId = state?.order?.line;
  if (!itemId) return false;

  const info = getVariantById(itemId);
  if (!info) {
    showAck("error", "Món không hợp lệ", 1800);
    return false;
  }

  updateCartQuantity(itemId, 1);
  showAck("success", "Đã thêm vào giỏ hàng", 1200);
  return true;
}

/* ========================================================
   PAYLOAD
======================================================== */

function createOrderId() {
  return `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getRawOrderItems(state, action) {
  if (action === "send-cart") {
    return state.cart?.items || [];
  }

  if (action === "instant") {
    const line = state.order?.line;
    return line ? [{ id: line, qty: 1 }] : [];
  }

  return [];
}

function buildItems(rawItems) {
  return rawItems
    .map(cartItem => {
      const info = getVariantById(cartItem.id);
      if (!info) return null;

      return {
        id: cartItem.id,
        category: info.categoryKey,
        productKey: info.productKey,
        variantKey: info.variantKey,
        item: info.productLabel,
        option: info.variantLabel,
        qty: Number(cartItem.qty || 0),
        unit: info.unit || "item",
        price: Number(info.price || 0)
      };
    })
    .filter(Boolean)
    .filter(item => item.qty > 0);
}

function buildPayload(state, action) {
  if (action !== "send-cart" && action !== "instant") return null;

  const rawItems = getRawOrderItems(state, action);
  if (!rawItems.length) return null;

  const items = buildItems(rawItems);
  if (!items.length) return null;

  const ctx = getContext();
  const anchor = ctx?.anchor || null;
  const active = ctx?.active || null;

  if (!anchor?.type || !active?.id) {
    return null;
  }

  return {
    id: createOrderId(),
    type: action === "send-cart" ? "cart" : "instant",
    timestamp: new Date().toISOString(),
    mode: anchor.type,
    place: active.id,
    placeType: active.type || "",
    device: navigator.userAgent,
    items
  };
}
/* ========================================================
   ORDER SUCCESS / RESET
======================================================== */

function resetOrderState() {
  setState({
    order: {
      action: null,
      line: null,
      status: "idle",
      msg: "",
      at: null
    }
  });
}

export function finalizeOrderSuccess(action) {
  const patch = {
    overlay: { view: null },
    order: {
      action: null,
      line: null,
      status: "idle",
      msg: "",
      at: null
    }
  };

  if (action === "send-cart") {
    patch.cart = { items: [] };
    setState(patch);
    showAck("success", "Đơn hàng đã được gửi", 2200);
    return;
  }

  setState(patch);
  showAck("success", "Yêu cầu đã được gửi", 2200);
}

/* ========================================================
   SEND ACTIONS
======================================================== */

async function submitOrder(state, action) {
  const payload = buildPayload(state, action);
  if (!payload) {
    showAck("error", "Không có dữ liệu để gửi", 1800);
    return false;
  }

  setState({
    order: {
      ...state.order,
      status: "pending"
    }
  });

  showAck("sending", "Đang gửi yêu cầu...", 0);

  try {
    const res = await sendRequest(payload);

    if (res?.success === true) {
      finalizeOrderSuccess(action);
      return true;
    }

    throw new Error(res?.message || "send_failed");
  } catch (err) {
    setState({
      order: {
        ...getState().order,
        status: "error"
      }
    });

    showAck("error", "Không thể gửi lúc này", 2200);
    return false;
  }
}

export async function buyNow(state) {
  return submitOrder(state, "instant");
}

export async function sendCart(state) {
  const cartItems = state?.cart?.items || [];
  if (!cartItems.length) {
    showAck("error", "Giỏ hàng đang trống", 1500);
    return false;
  }

  return submitOrder(state, "send-cart");
}