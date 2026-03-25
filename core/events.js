// core/events.js

import { UI, setState, getState } from "./state.js";
import { enqueue } from "./queue.js";
import { openPicker } from "../ui/render/renderPlacePicker.js";
import { CONFIG } from "../config.js";
import { renderStatusBar } from "../ui/render/renderStatusBar.js";
import { getFullCartItems, getFullItemInfo } from "../ui/utils/cartHelpers.js";


/* ---------- CONSTANTS ---------- */

export function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CONFIG.CART_KEY) || "[]");
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

/* ---------- CART MANAGEMENT ---------- */

export function clearCart() {
  setState({ cart: { items: [] } });
  localStorage.removeItem(CONFIG.CART_KEY);
}

export function addToCart(line) {
  const state = getState();
  const current = state.cart?.items || [];

  const index = current.findIndex(i =>
    i.category === line.category &&
    i.item === line.item &&
    i.option === line.option
  );

  let nextItems;
  if (index >= 0) {
    nextItems = current.map((it, idx) =>
      idx === index ? { ...it, qty: (it.qty || 0) + (line.qty || 1) } : it
    );
  } else {
    nextItems = [...current, { ...line, qty: line.qty || 1 }];
  }

  setState({ cart: { ...state.cart, items: nextItems } });
}

/* ---------- ORDERING ACTIONS ---------- */

export async function sendInstant(line) {
  // 1. Dùng Helper để lấy đầy đủ Label/Price từ MENU
  const fullItem = getFullItemInfo(line);
  
  // 2. Đóng gói đơn hàng 1 món
  const payload = buildPayload([fullItem], "INSTANT");
  if (!payload) return; // Dừng nếu chưa chọn phòng

  return await enqueue(payload);
}

export async function sendCart() {
  const state = getState();
  // 1. Làm đầy dữ liệu cho toàn bộ giỏ hàng
  const fullItems = getFullCartItems(state.cart.items);
  
  if (fullItems.length === 0) return;

  // 2. Đóng gói đơn hàng từ giỏ
  const payload = buildPayload(fullItems, "CART");
  if (!payload) return;

  return await enqueue(payload);
}

/* ---------- HELPER: BUILD PAYLOAD ---------- */

function buildPayload(items, type = "CART") {
  const state = getState();
  const active = state.context?.active;

  // SỬA LỖI: Kiểm tra tập trung thông tin vị trí
  if (!active || !active.place) {
    setState({ view: { ...state.view, overlay: "placePicker" } });
    return null;
  }

  return {
    type: type,
    timestamp: new Date().toISOString(),
    // Thông tin khách hàng & vị trí
    place: active.place,
    customer: active.name || "Guest",
    // Dữ liệu món ăn (Đã có đủ name, optionLabel, price nhờ Helper)
    items: items, 
    total: items.reduce((sum, i) => sum + (i.price * i.qty), 0),
    note: state.cart.note || ""
  };
}
