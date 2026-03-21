// core/events.js

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { resetCartSnapshot } from "../ui/render/renderDrawer.js";
import { openPicker } from "../ui/components/placePicker.js";

let pendingIntent = null;


const CART_KEY = "haven_cart";

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
  resetCartSnapshot(); // Reset mốc so sánh về rỗng
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


// 1. Hàm này sẽ được gọi nhận được status "success" từ GS
export function onOrderSuccess() {
  clearCart();             // Xóa giỏ trong State & LocalStorage
  resetCartSnapshot();     // Reset mốc so sánh để nút Drawer về màu xanh
  
  // Hiển thị thông báo thành công cho khách (Ack)
  setState({ ack: { state: "show", status: "success" } });
  
  // Tự động ẩn thông báo sau 2.5 giây
  setTimeout(() => {
    setState({ ack: { state: "hidden" } });
  }, 2500);
}

export function sendCart() {
  const ctx = getContext();
  if (UI.ack.state !== "hidden") return;

  const items = UI.cart.items || [];
  if (!items.length) return;

  // Đẩy vào hàng đợi với key đã chuẩn hóa là 'items'
  enqueue({
    type: "cart",
    place: ctx.active.id,
    mode: ctx.active.type,
    items: items // Đã chuẩn hóa
  });

  // Hiện lớp phủ "Đang gửi..."
  setState({ ack: { state: "show", status: "sending" } });
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
    
  });
}
export function dispatchAction(product) {
  if (ensureActive()) {

    if ({ type: "cart" }) addToCart(product);
    if ({ type: "instant" }) sendCart(product);
  } else {
    openPicker();
    return;
  }
}