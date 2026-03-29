// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getCartExtended } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  // Lấy các element con
  const drawerHeader = drawer.querySelector(".drawer__header-title");
  const totalEl = drawer.querySelector(".drawer__header-price");
  const countEl = drawer.querySelector(".drawer__header-count");
  const uniqueEl = drawer.querySelector(".drawer__header-unique");
  const itemsEl = document.getElementById("drawerItems");
  const summaryEl = drawer.querySelector(".drawer-summary");
  const sendBtn = document.getElementById("drawerSend");

  const cart = getCartExtended(state);

  drawerHeader.textContent = translate("cart_bar.cart_title");

  if (cart.isEmpty) {
    if (summaryEl) summaryEl.classList.add("hidden");
    itemsEl.innerHTML = `<div class="p-xl center opacity-50">${translate("cart_bar.empty")}</div>`;
    if (totalEl) totalEl.textContent = "0 đ";
    if (countEl) countEl.textContent = "0";
    return;
  }

  if (summaryEl) summaryEl.classList.remove("hidden");
  totalEl.textContent = cart.totalPrice;
  
  countEl.textContent = cart.totalQty;
  uniqueEl.textContent = cart.itemUnique;

  // 3. Vẽ danh sách món
  itemsEl.innerHTML = cart.items.map(item => `
    <div class="drawer__item drawer-item" data-id="${item.id}">
      <div class="drawer__info">
        <strong>${item.productLabel}</strong>
        <span class="drawer__variant text-xs opacity-70">${item.variantLabel}</span>
        <span class="text-s font-bold">${item.linePrice}</span>
      </div>
      <div class="drawer-qty row items-center gap-s">
        <button class="qty-btn" data-action="update-qty" data-value="${item.id}" data-delta="-1">-</button>
        <span class="qty-val" data-qty-id="${item.id}">${item.qty}</span>
        <button class="qty-btn" data-action="update-qty" data-value="${item.id}" data-delta="1">+</button>
      </div>
    </div>
  `).join("");
}
 