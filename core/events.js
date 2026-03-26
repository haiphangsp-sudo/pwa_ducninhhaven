// core/events.js

import { UI, setState, getState } from "./state.js";
import { enqueue } from "./queue.js";
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
  const state = getState();
  const newItems = state.cart.items;
  const item = newItems[index];
  if (!item) return;

  // Nếu khách bấm giảm khi chỉ còn 1 món -> Hỏi nhẹ một câu
  if (item.qty === 1 && delta === -1) {
    const confirmDelete = confirm(`Bạn muốn bỏ món "${item.name || item.item}" khỏi giỏ hàng?`);
    if (!confirmDelete) return; 
  }

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
  // 1. Lấy bản sao an toàn (đã được clone)
  const state = getState(); 
  
  // 2. Tính toán trên bản sao
  const current = state.cart?.items || [];
  const nextItems = calculateCartUpdate(current, line);

  // 3. Đẩy bản sao đã chỉnh sửa về hệ thống để kích hoạt Render
  setState({ 
    cart: { 
      ...state.cart, 
      items: nextItems 
    } 
  });
}

/* ---------- ORDERING ACTIONS ---------- */

export async function sendInstant(line) {
  // BƯỚC 1: Lấy thông tin nhãn và giá từ MENU
  const fullItem = getFullItemInfo(line); 
  
  // BƯỚC 2: Đóng gói đơn hàng 1 món
  const payload = buildPayload([fullItem], state, "instant");
  if (!payload) return; 

  return await enqueue(payload);
}

// --- GỬI GIỎ HÀNG (CART) ---
export async function sendCart() {
  const state = getState();
  // Hydrate dữ liệu trước khi đóng gói
  const fullItems = getFullCartItems(state.cart.items);
  
  if (fullItems.length === 0) return;

  const payload = buildPayload(fullItems, state);
  if (!payload) return; // Ngừng nếu buildPayload trả về null

  return await enqueue(payload);
}

// --- HÀM CHUẨN HÓA CHUNG ---
function buildPayload(items, state) {
  return {
    type: items.action, 
    timestamp: new Date().toISOString(),
    mode: state.context?.mode,
    place: state.context.active?.id,
    items: items, 
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    note: state.cart.note || ""
  };
}
