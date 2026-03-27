// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer || drawer.classList.contains("hidden")) return;

  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const items = state.cart.items || [];

  // 1. Cập nhật Tiêu đề địa điểm
  const activePlace = state.context.active;
  document.getElementById("namePlace").textContent = activePlace 
    ? `${translate("place.served")}: ${activePlace.name}` 
    : translate("place.select");

  // 2. Vẽ danh sách món
  if (items.length === 0) {
    itemsContainer.innerHTML = `<div class="p-m center text-muted">${translate("cart_bar.empty")}</div>`;
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    return;
  }

  let total = 0;
  itemsContainer.innerHTML = items.map(cartItem => {
    const info = getItemById(cartItem.id);
    if (!info) return "";
    total += info.price * cartItem.qty;
    
    return `
      <div class="drawer-item row justify-between p-m border-b">
        <div class="stack">
          <strong>${info.name}</strong>
          <span class="text-s text-muted">${info.price.toLocaleString()}đ</span>
        </div>
        <div class="row items-center gap-m">
          <button data-action="update-qty" data-value="${cartItem.id}" data-delta="-1">-</button>
          <span class"qty-val">${cartItem.qty}</span>
          <button data-action="update-qty" data-value="${cartItem.id}" data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("");

  // 3. Cập nhật nút gửi đơn
  sendBtn.textContent = `${translate("cart_bar.send_order")} • ${total.toLocaleString()}đ`;
  sendBtn.dataset.action = activePlace ? "send_cart" : "open-overlay";
  sendBtn.dataset.value = activePlace ? "" : "placePicker";
}