// core/events.js

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { renderStatusBar } from "../ui/render/renderStatusBar.js";
import { getState } from "./state.js";



/* ---------- CONSTANTS ---------- */

const CART_KEY = "haven_cart";

let pendingIntent = null;

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


/* ---------- CONTEXT ---------- */

function ensureActive() {
  const ctx = getContext();
  return !!ctx?.active;
}

/* ---------- CART ---------- */

function toLineItem(payload) {
  return {
    category: payload.category,
    item: payload.item,
    option: payload.option,
    price: payload.price,
    qty: payload.qty || 1
  };
}

export function addToCart(line) {
  const current = UI.cart?.items || [];

  const index = current.findIndex(i =>
    i.category === line.category &&
    i.item === line.item &&
    i.option === line.option &&
    i.price === line.price
  );

  let items;

  if (index >= 0) {
    items = current.map((it, idx) =>
      idx === index
        ? { ...it, qty: (it.qty || 0) + (line.qty || 1) }
        : it
    );
  } else {
    items = [...current, { ...line, qty: line.qty || 1 }];
  }

  localStorage.setItem(CART_KEY, JSON.stringify(items));
  setState({ cart: { items } });
}

export function clearCart() {
  setState({ cart: { items: [] } });
  localStorage.removeItem(CART_KEY);
}

/* ---------- SUBMIT ---------- */

export function requestSubmit(items, orderType = "cart") {
  if (!items?.length) return false;

  if (ensureActive()) {
    return submitItems(items, orderType);
  }

  pendingIntent = {
    type: orderType,
    items
  };

  window.dispatchEvent(new CustomEvent("needplace"));
  return false;
}

function submitItems(items, orderType) {
  const ctx = getContext();
  if (!ctx?.active) return false;

  enqueue({
    type: orderType,
    place: ctx.active.id,
    mode: ctx.active.type,
    items
  });

  setState({ ack: { state: "show", status: "sending" } });
  return true;
}

/* ---------- ORCHESTRATOR ---------- */

export function attachOrchestrator() {
  window.addEventListener("contextchange", (e) => {
    if (!pendingIntent) return;

    const ctx = e.detail?.next;
    if (!ctx?.active) return;

    if (pendingIntent.type === "cart") {
      pendingIntent = null;
      window.dispatchEvent(new CustomEvent("intentresume", {
        detail: { mode: "send_cart" }
      }));
      return;
    }

    if (pendingIntent.type === "instant") {
      const items = pendingIntent.items;
      pendingIntent = null;
      submitItems(items, "instant");
    }
  });
}