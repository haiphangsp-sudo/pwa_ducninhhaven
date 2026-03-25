// core/events.js

import { UI, setState, getState } from "./state.js";
import { enqueue } from "./queue.js";
import { openPicker } from "../ui/render/renderPlacePicker.js";
import { CART_KEY } from "../config.js";
import { getFullCartItems } from "../ui/utils/cartHelpers.js";
import { renderStatusBar } from "../ui/render/renderStatusBar.js";



/* ---------- CONSTANTS ---------- */


let pendingIntent = null;

export function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    setState({ cart: { items } });
  } catch {
    clearCart();
  }
}
export function clearCart() {
  setState({ cart: { items: [] } });
  localStorage.removeItem(CART_KEY);
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

/* ---------- CART ---------- */


export function addToCart(line) {
  // 1. Lấy state hiện tại từ nguồn chuẩn
  const state = getState();
  const current = state.cart?.items || [];

  // 2. Tìm vị trí món
  const index = current.findIndex(i =>
    i.category === line.category &&
    i.item === line.item &&
    i.option === line.option
  );

  let nextItems;

  if (index >= 0) {
    // Cập nhật số lượng món đã có
    nextItems = current.map((it, idx) =>
      idx === index
        ? { ...it, qty: (it.qty || 0) + (line.qty || 1) }
        : it
    );
  } else {
    // Thêm món mới
    nextItems = [...current, { ...line, qty: line.qty || 1 }];
  }

  // 3. Cập nhật State (Giữ lại các thuộc tính khác của cart như note, context...)
  setState({ 
    cart: { 
      ...state.cart, 
      items: nextItems 
    } 
  });

}


export async function sendInstant(line) {
  // Lấy thông tin chi tiết món này từ MENU dựa trên lineItem
  const item = getFullCartItems(line); 
  
  // Đóng gói thành mảng có 1 phần tử
  const payload = buildPayload([item], "INSTANT");
  return await enqueue(payload);
}


export async function sendCart() {
  const state = getState();
  const items = getFullCartItems(state.cart.items); // Lấy thông tin chi tiết từ MENU
  
  if (items.length === 0) return;

  const payload = buildPayload(items, "CART");
  return await enqueue(payload);
  
}

function buildPayload(items, type = "CART") {
  const state = getState();
  
  if (!state.context.active) {
    openPicker(); // Ép khách chọn vị trí trước
    return;
  } else {
    const { active } = state.context; // Thông tin phòng/bàn và khách hàng
  }
  return {
    // 1. Thông tin định danh (Metadata)
    type: type, 
    timestamp: new Date().toISOString(),
    
    // 2. Thông tin khách & vị trí (Context)
    place: active?.place || "Unknown",
    customer: active?.name || "Khách vãng lai",
    note: state.cart.note || "", // Ghi chú chung của đơn hàng

    // 3. Nội dung đơn hàng (Content)
    items: items, // Danh sách món đã qua xử lý getFullCartItems
    total: items.reduce((sum, i) => sum + (i.price * i.qty), 0)
  };
}