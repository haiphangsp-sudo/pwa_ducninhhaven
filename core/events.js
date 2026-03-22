// core/events.js

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";
import { resetCartSnapshot } from "../ui/render/renderDrawer.js";

const CART_KEY = "haven_cart";

let pendingIntent = null;

/* ---------- PUBLIC ---------- */

export function dispatchAction(payload) {
  switch (payload.type) {
    case "cart":
      return addToCart(toLineItem(payload));

    case "instant":
      return requestSubmit([toLineItem(payload)], {
        reason: "send_instant",
        source: "menu",
        orderType: "instant"
      });

    case "send_cart":
      return requestSubmit(UI.cart.items || [], {
        reason: "send_cart",
        source: "drawer",
        orderType: "cart"
      });

    default:
      return;
  }
}

export function ensureActive() {
  const ctx = getContext();
  return !!ctx?.active;
}

/* ---------- CART ---------- */

function toLineItem(payload) {
  return {
    category: payload.category,
    item: payload.item,
    option: payload.option,
    qty: payload.qty || 1
  };
}

export function addToCart(line) {
  const items = [...(UI.cart?.items || [])];

  const existing = items.find(i =>
    i.category === line.category &&
    i.item === line.item &&
    i.option === line.option
  );

  if (existing) existing.qty += line.qty || 1;
  else items.push({ ...line, qty: line.qty || 1 });

  localStorage.setItem(CART_KEY, JSON.stringify(items));
  setState({ cart: { items } });
}

export function clearCart() {
  setState({ cart: { items: [] } });
  localStorage.removeItem(CART_KEY);
  resetCartSnapshot();
}

export function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    setState({ cart: { items } });
  } catch {
    clearCart();
  }
}

export function updateCartQuantity(index, delta) {
  const newItems = JSON.parse(JSON.stringify(UI.cart.items || []));
  const item = newItems[index];
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    newItems.splice(index, 1);
  }

  setState({ cart: { items: newItems } });
  localStorage.setItem(CART_KEY, JSON.stringify(newItems));
}

/* ---------- SUBMIT ---------- */

export function requestSubmit(items, meta = {}) {
  if (!items?.length) return false;

  if (ensureActive()) {
    return submitItems(items, meta.orderType || "cart");
  }

  pendingIntent = {
    type: meta.reason || "send_cart",
    items,
    orderType: meta.orderType || "cart"
  };

  openPicker({
    source: meta.source || "unknown",
    reason: meta.reason || "send_cart"
  });

  return false;
}

export function submitItems(items, orderType = "cart") {
  const ctx = getContext();
  if (!ctx?.active) return false;
  if (!items?.length) return false;
  if (UI.ack.state !== "hidden") return false;

  setState({ ack: { state: "show", status: "sending" } });

  enqueue({
    type: orderType,
    place: ctx.active.place,
    mode: ctx.active.type,
    products: items
  });

  return true;
}

export function onOrderSuccess(orderType = "cart") {
  if (orderType === "cart") {
    clearCart();
  }

  setState({ ack: { state: "show", status: "success" } });

  setTimeout(() => {
    setState({ ack: { state: "hidden", status: null } });
  }, 2500);
}

/* ---------- ORCHESTRATION ---------- */

export function attachOrchestrator() {
  window.addEventListener("contextchange", (e) => {
    const detail = e.detail || {};
    const reason = detail.reason;
    const next = detail.next;

    if (!pendingIntent) return;
    if (!next?.active) return;

    if (pendingIntent.type === "send_cart" && reason === "send_cart") {
      pendingIntent = null;
      window.dispatchEvent(new CustomEvent("intentresume", {
        detail: { type: "send_cart" }
      }));
      return;
    }

    if (pendingIntent.type === "send_instant" && reason === "send_instant") {
      const items = pendingIntent.items;
      const orderType = pendingIntent.orderType;
      pendingIntent = null;
      submitItems(items, orderType);
    }
  });
}