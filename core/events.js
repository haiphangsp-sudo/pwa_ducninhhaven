// core/events.js

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";



const CART_KEY = "haven_cart";

/* ---------- CART ---------- */

export function dispatchAction(payload) {
  switch (payload.type) {

    case "instant": 
      if(!ensureActive())return;
      sendInstant(payload);
      return;

    case "cart":
      return addToCart(payload);
  
    default:
      return;
  }
}

function ensureActive(payload) {
  const ctx = getContext();
  if (!ctx?.active) {
    enqueue({
    payload
    });
    openPicker();
    return false;
  }
  return true;
}

export function addToCart(item) {
  
  const Items = [...(UI.cart?.items || [])];

  const existing = Items.find(i =>
    i.category===item.category &&
    i.item===item.item &&
    i.option===item.option
  );

  if(existing) existing.qty += 1;
  else Items.push({...item,qty:1});

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(Items)
  );

  setState({cart:{items:Items}});
}

export function updateCart() {

  setState({
    cart: {
      ...UI.cart,
      changed: false
    }
  });
}
/* ---------- SEND ---------- */

function sendInstant(action){
  const ctx = getContext();
  if (UI.ack.state !== "hidden") return;
  
  setState({ack:{state:"show"}});

  enqueue({
    type: "instant",
    place: ctx.active.id,
    mode: ctx.active.type,
    category: action.category,
    item: action.item,
    option: action.option,
    qty:1
  });
}

export function sendCart() {

  if(!ensureActive()) return;
  
  const ctx = getContext();
  if (UI.ack.state !== "hidden") return;
  
  const items = UI.cart.items || [];
  if (!items.length) return;

  enqueue({
    type: "cart",
    place: ctx.active.id,
    mode: ctx.active.type,
    item: items
  });

  setState({ack: { state: "show" }});
}

export function clearCart() {
  setState({cart: { items: [] }});
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

// Hàm cập nhật số lượng món trong giỏ (Chạy ngay khi bấm + / -)
export function updateCartQuantity(index, delta) {
    // 1. TẠO BẢN SAO SÂU (Deep Clone) - Đây là bước quan trọng nhất
    // Sử dụng structuredClone để đảm bảo mảng mới hoàn toàn khác mảng cũ về ô nhớ
    const newItems = structuredClone(UI.cart.items);
    const item = newItems[index];

    if (!item) return;

    item.qty += delta;

    // Xóa món nếu số lượng về 0
    if (item.qty <= 0) {
        newItems.splice(index, 1);
    }

    // 2. Gửi bản sao mới vào setState
    // Bây giờ prev !== next sẽ trả về TRUE, kích hoạt renderApp ngay lập tức
    setState({ cart: { items: newItems } });
    
    // Lưu lại vào bộ nhớ
    localStorage.setItem("haven_cart", JSON.stringify(newItems));
}