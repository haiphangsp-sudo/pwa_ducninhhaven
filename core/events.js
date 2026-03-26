// core/events.js

import { UI, setState, getState } from "./state.js";
import { enqueue } from "./queue.js";
import { openPicker } from "../ui/render/renderPlacePicker.js";
import { CONFIG } from "../config.js";
import { renderStatusBar } from "../ui/render/renderStatusBar.js";
import { getFullCartItems, getFullItemInfo, calculateCartUpdate } from "../ui/utils/cartHelpers.js";


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
  const current = UI.cart?.items || [];
  const items = calculateCartUpdate(current, line);

  setState({ cart: { items } });
}

/* ---------- ORDERING ACTIONS ---------- */

export async function sendInstant(line) {
  // BƯỚC 1: Lấy thông tin nhãn và giá từ MENU
  const fullItem = getFullItemInfo(line); 
  
  // BƯỚC 2: Đóng gói đơn hàng 1 món
  const payload = buildPayload([fullItem], "INSTANT");
  if (!payload) return; 

  return await enqueue(payload);
}

// --- GỬI GIỎ HÀNG (CART) ---
export async function sendCart() {
  const state = getState();
  // Hydrate dữ liệu trước khi đóng gói
  const fullItems = getFullCartItems(state.cart.items);
  
  if (fullItems.length === 0) return;

  const payload = buildPayload(fullItems, "CART");
  if (!payload) return; // Ngừng nếu buildPayload trả về null

  return await enqueue(payload);
}

// --- HÀM CHUẨN HÓA CHUNG ---
function buildPayload(items, type = "CART") {
  return {
    type: type, 
    timestamp: new Date().toISOString(),
    mode: state.context?.mode,
    place: active.id,
    items: items, 
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    note: state.cart.note || ""
  };
}
