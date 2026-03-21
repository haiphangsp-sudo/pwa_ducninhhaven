// core/events.js

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";

const CART_KEY = "haven_cart";

/* ---------- pending intent ---------- */

let pendingIntent = null;

/* ---------- PUBLIC ACTIONS ---------- */

export function dispatchAction(payload) {
  switch (payload.type) {
    case "cart":
      return addToCart(payload);

    case "instant":
      if (ensureActive()) {
        sendInstant(payload);
        return;
      }

      pendingIntent = {
        type: "send_instant",
        payload
      };

      openPicker({
        source: "menu",
        reason: "send_instant"
      });
      return;

    case "send_cart":
      if (ensureActive()) {
        sendCart();
        return;
      }

      pendingIntent = {
        type: "send_cart"
      };

      openPicker({
        source: "drawer",
        reason: "send_cart"
      });
      return;

    default:
      return;
  }
}

export function ensureActive() {
  const ctx = getContext();
  return !!ctx?.active;
}

/* ---------- CART ---------- */

export function addToCart(item) {
  const items = [...(UI.cart?.items || [])];

  const existing = items.find(i =>
    i.category === item.category &&
    i.item === item.item &&
    i.option === item.option
  );

  if (existing) existing.qty += 1;
  else items.push({ ...item, qty: 1 });

  localStorage.setItem(CART_KEY, JSON.stringify(items));
  setState({ cart: { items } });
}

export function clearCart() {
  setState({ cart: { items: [] } });
  localStorage.removeItem(CART_KEY);
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

/* ---------- SEND ---------- */

function sendInstant(action) {
  const ctx = getContext();
  if (!ctx?.active) return;
  if (UI.ack.state !== "hidden") return;

  setState({ ack: { state: "show" } });

  enqueue({
    type: "instant",
    place: ctx.active.id,
    mode: ctx.active.type,
    items: [{
      category: action.category,
      item: action.item,
      option: action.option,
      qty: 1
    }]
  });
}

export function sendCart() {
  const ctx = getContext();
  if (!ctx?.active) return;
  if (UI.ack.state !== "hidden") return;

  const items = UI.cart.items || [];
  if (!items.length) return;

  enqueue({
    type: "cart",
    place: ctx.active.id,
    mode: ctx.active.type,
    items
  });

  setState({ ack: { state: "show" } });
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
      const payload = pendingIntent.payload;
      pendingIntent = null;

      if (payload) {
        sendInstant(payload);
      }
    }
  });
}