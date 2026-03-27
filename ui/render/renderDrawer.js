// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  
  // Chốt chặn 1: Nếu không tìm thấy các ID quan trọng, dừng lại ngay để tránh crash
  if (!drawer || !itemsContainer || !sendBtn) {
    console.error("Thiếu ID trong HTML: cartDrawer, drawerItems hoặc drawerSend");
    return;
  }

  // Chốt chặn 2: Nếu đang ẩn thì không làm gì cả
  if (drawer.classList.contains("hidden")) return;

  const cartItems = state.cart.items || [];
  const activePlace = state.context.active;

  // --- CẬP NHẬT HEADER (Dùng ID namePlace) ---
  const namePlaceEl = document.getElementById("namePlace");
  if (namePlaceEl) {
    namePlaceEl.textContent = activePlace 
      ? `${translate("place.served")}: ${activePlace.name}` 
      : translate("place.select");
  }

  // --- XỬ LÝ GIỎ HÀNG TRỐNG ---
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="p-xl center text-muted stack items-center">
        <div class="text-xxl mb-m">🛒</div>
        <p>${translate("cart_bar.empty")}</p>
      </div>`;
    
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "cartDrawer";
    
    // Ẩn các thông số header nếu có
    const summary = drawer.querySelector(".drawer-summary");
    if (summary) summary.classList.add("hidden");
    return;
  }

  // --- VẼ DANH SÁCH MÓN ---
  let totalPrice = 0;
  let totalQty = 0;

  const html = cartItems.map(cartItem => {
    // Gọi hàm tìm món (đã được sửa lỗi iterable)
    const info = getItemById(cartItem.id);
    if (!info) return ""; 

    totalPrice += (info.price || 0) * cartItem.qty;
    totalQty += cartItem.qty;

    const displayName = info.parentName ? `${info.parentName} (${info.name})` : info.name;

    return `
      <div class="drawer__item row items-center justify-between p-m border-b">
        <div class="stack">
          <strong class="text-m">${displayName}</strong>
          <span class="text-s text-muted">${(info.price || 0).toLocaleString()}đ</span>
        </div>
        <div class="row items-center gap-m">
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="-1">—</button>
          <span class="font-bold">${cartItem.qty}</span>
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("");

  itemsContainer.innerHTML = html;

  // --- CẬP NHẬT FOOTER & STATS ---
  const summary = drawer.querySelector(".drawer-summary");
  if (summary) summary.classList.remove("hidden");

  // Cập nhật các con số nhỏ trên header (nếu có element)
  const hCount = drawer.querySelector(".drawer__header-count");
  if (hCount) hCount.textContent = `${totalQty} món`;

  // Cập nhật nút gửi
  if (activePlace) {
    sendBtn.textContent = `${translate("cart_bar.send_order")} • ${totalPrice.toLocaleString()}đ`;
    sendBtn.dataset.action = "send_cart";
    sendBtn.classList.remove("text-warning");
  } else {
    sendBtn.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
    sendBtn.classList.add("text-warning");
  }
}