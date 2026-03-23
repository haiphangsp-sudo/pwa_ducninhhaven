// core/events.js

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";
import { renderStatusBar } from "../ui/render/renderStatusBar.js";
import { getState } from "./state.js";


/* ---------- CONSTANTS ---------- */

const CART_KEY = "haven_cart";

let pendingIntent = null;

/* ---------- PUBLIC ---------- */

export function dispatchAction(payload) {
  switch (payload.type) {
    case "cart":
      return addToCart(toLineItem(payload));

    case "instant":
      return requestSubmit([toLineItem(payload)], {
        orderType: "instant"
      });

    case "send_cart":
      return requestSubmit(UI.cart.items || [], {
        orderType: "cart"
      });

    default:
      return;
  }
}

/* ---------- CONTEXT ---------- */

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
    type: meta.orderType || "cart",
    items
  };

  openPicker(); 
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
    place: ctx.active.id,
    mode: ctx.active.type,
    items
  });

  return true;
}


/* ---------- ORCHESTRATION ---------- */

export function attachOrchestrator() {
  window.addEventListener("contextchange", (e) => {
    if (!pendingIntent) return;

    const ctx = e.detail?.next;
    if (!ctx?.active) return;

    /* ===== CART ===== */
    if (pendingIntent.type === "cart") {
      pendingIntent = null;

      window.dispatchEvent(new CustomEvent("intentresume", {
        detail: { type: "send_cart" }
      }));
      return;
    }

    /* ===== INSTANT ===== */
    if (pendingIntent.type === "instant") {
      const items = pendingIntent.items;
      pendingIntent = null;

      submitItems(items, "instant");
    }
  });
}

/* ---------- EVENTS ---------- */

export function onOrderSuccess(orderId, items) { // Nhận thêm orderId từ server
  clearCart();

  // Đẩy đơn hàng mới vào State để StatusBar và Tracker có dữ liệu hiển thị
  const newOrder = {
    id: orderId,
    status: 'pending', // Trạng thái mặc định
    items: items,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const currentOrders = getState().orders.active || [];
  setState({ orders: { active: [...currentOrders, newOrder] } });

  // Lưu ID vào localStorage để F5 không mất
  const savedIds = JSON.parse(localStorage.getItem("haven_active_order_ids") || "[]");
  localStorage.setItem("haven_active_order_ids", JSON.stringify([...savedIds, orderId]));

  setState({ ack: { state: "show", status: "success" } });
  
  // Cập nhật ngay thanh StatusBar
  renderStatusBar(); 
}