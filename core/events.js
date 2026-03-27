// core/events.js

import { getState, setState } from "./state.js";
import { enqueue } from "./queue.js";
import {
  calculateCartUpdate,
  getFullCartItems,
  getFullItemInfo
} from "../ui/utils/cartHelpers.js";

export function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CONFIG.CART_KEY) || "[]");
    setState({ cart: { items } });
  } catch {
    clearCart();
  }
}

/* =======================================================
   LINE ITEM
======================================================= */

export function makeLineItem(raw = {}) {
  return {
    category: raw.category,
    item: raw.item,
    option: raw.option,
    qty: Number(raw.qty || 1)
  };
}

export function isValidLineItem(line) {
  return !!(
    line &&
    line.category &&
    line.item &&
    line.option &&
    Number(line.qty || 0) > 0
  );
}

/* =======================================================
   CART
======================================================= */

export function addToCart(raw) {
  const state = getState();
  const line = makeLineItem(raw);

  if (!isValidLineItem(line)) return false;

  const currentItems = state.cart.items || [];
  const nextItems = calculateCartUpdate(currentItems, line);

  setState({
    cart: {
      items: nextItems
    }
  });

  return true;
}

export function updateCartQuantity(index, delta) {
  const state = getState();
  const currentItems = state.cart.items || [];

  if (!Array.isArray(currentItems)) return false;
  if (index < 0 || index >= currentItems.length) return false;

  const nextItems = currentItems.map(it => ({ ...it }));
  const target = nextItems[index];
  if (!target) return false;

  target.qty = Number(target.qty || 0) + Number(delta || 0);

  if (target.qty <= 0) {
    nextItems.splice(index, 1);
  }

  setState({
    cart: {
      items: nextItems
    }
  });

  return true;
}

export function clearCart() {
  setState({
    cart: {
      items: []
    }
  });
}

/* =======================================================
   ORDER BUILD
======================================================= */

export function buildPayload(orderItems, state, type = "cart") {
  const active = state?.context?.active;

  if (!active?.id || !active?.type) return null;
  if (!Array.isArray(orderItems) || orderItems.length === 0) return null;

  return {
    type, // "cart" | "instant"
    timestamp: new Date().toISOString(),
    place: active.id,
    mode: active.type,
    items: orderItems,
    total: orderItems.reduce((sum, item) => {
      return sum + Number(item.subtotal || 0);
    }, 0),
    note: state.cart?.note || ""
  };
}

/* =======================================================
   SEND
======================================================= */

export async function sendOrder(orderItems, type = "cart") {
  const state = getState();
  const payload = buildPayload(orderItems, state, type);

  if (!payload) return null;

  setState({
    ack: {
      state: "show",
      status: "sending"
    }
  });

  return await enqueue(payload);
}

/**
 * Gửi toàn bộ giỏ hàng
 */
export async function sendCart() {
  const state = getState();
  const fullItems = getFullCartItems(state.cart.items || []);

  if (!fullItems.length) return null;

  return await sendOrder(fullItems, "cart");
}

/**
 * Mua ngay = gửi ngay 1 sản phẩm
 */
export async function buyNow(raw) {
  const line = makeLineItem(raw);
  if (!isValidLineItem(line)) return null;

  const fullItem = getFullItemInfo(line);
  if (!fullItem) return null;

  return await sendOrder([fullItem], "instant");
}

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