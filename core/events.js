// core/events.js

import { getState, setState } from "./state.js";
import { enqueue } from "./queue.js";
import {
  calculateCartUpdate,
  getFullCartItems,
  getFullItemInfo
} from "../ui/utils/cartHelpers.js";



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

export function addToCart(line) {
  const state = getState(); 
  
  const current = state.cart.items || [];

  const nextItems = calculateCartUpdate(current, line);

  setState({ 
    cart: { 
      ...state.cart, 
      items: nextItems 
    } 
  });
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

function buildPayload(items, state) {
  return {
    type: items.action, 
    timestamp: new Date().toISOString(),

    mode: state.context?.mode,
    place: state.context.active?.id,

    items: items.map(i => ({
      id: i.id,
      qty: i.qty,
      price: i.price,
      subtotal: i.subtotal
    })),

    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    note: state.cart.note || ""
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

export async function handleSendCartAction() {
  // 1. Logic bắt đầu: Hiện Loading
  setState({ ack: { state: "show", status: "sending" } });

  // 2. Gọi Helper nội bộ
  const result = await sendCart();

  // 3. Logic kết thúc: Dọn dẹp
  if (result === "ok") {
    setState({
      cart: { items: [], status: 'idle' },
      overlay: { view: null },
      order: { type: "cart", line: null },
      ack: { state: "show", status: "success" }
    });
    
    // Auto-hide thông báo
    setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
  } else {
    // Xử lý khi có lỗi
    setState({ ack: { state: "show", status: "error" } });
  }
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