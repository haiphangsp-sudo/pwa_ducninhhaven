
// ui/render/renderDrawer.js

import { translate } from "../utils/translate.js";
import { getVariantById, getCartExtended } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  const titleEl = drawer.querySelector(".drawer__header-title");
  const placeEl = document.getElementById("drawerPlaceDisplay");
  const totalEl = drawer.querySelector(".drawer__header-price");
  const countEl = drawer.querySelector(".drawer__header-count");
  const uniqueEl = drawer.querySelector(".drawer__header-unique");
  const itemsEl = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const summaryEl = drawer.querySelector(".drawer-summary");

  if (!titleEl || !placeEl || !totalEl || !countEl || !uniqueEl || !itemsEl || !sendBtn || !summaryEl) {
    return;
  }
  const cartLines = getCartExtended(state);

  const activePlace = state.context?.active;

  titleEl.textContent = translate("cart_bar.cart_title");

  placeEl.textContent = activePlace?.label
    ? translate(activePlace.label)
    : activePlace?.id || translate("place.select");

  if (cartLines.isEmpty) {
    summaryEl.classList.add("hidden");

    itemsEl.innerHTML = `
      <div class="p-m center text-muted">
        ${translate("cart_bar.empty")}
      </div>
    `;

    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "cartDrawer";
    return;
  }

  summaryEl.classList.remove("hidden");

  totalEl.textContent = `${cartLines.totalPrice.toLocaleString("vi-VN")} đ`;
  countEl.textContent = `${cartLines.totalQty}`;
  uniqueEl.textContent = `${cartLines.length}`;

  itemsEl.innerHTML = cartLines.items.map(item => {

    const priceText = item.linePrice > 0
      ? `${item.linePrice.toLocaleString("vi-VN")} đ`
      : item.linePrice === 0
        ? translate("cart_bar.free")
        : translate("cart_bar.instant");

    return `
      <div class="drawer__item drawer-item" data-id="${item.id}">
        <div class="drawer__info">
          <strong>${item.itemLabel}</strong>
          <span class="drawer__variant">${item.optionLabel}</span>
          
          <span class="text-s text-muted">${priceText}</span>
          <span class="text-s text-muted">
            ${translate("cart_bar.subtotal") || "Tạm tính"}: ${item.subtotal.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div class="drawer-qty row items-center gap-s">
          <button
            class="qty-btn min"
            type="button"
            data-action="update-qty"
            data-value="${item.id}"
            data-delta="-1">-</button>

          <span class="qty-val" data-qty-id="${item.id}">${item.qty}</span>

          <button
            class="qty-btn plus"
            type="button"
            data-action="update-qty"
            data-value="${item.id}"
            data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("");

  if (activePlace?.id) {
    sendBtn.textContent = translate("cart_bar.send_order");
    sendBtn.dataset.action = "send_cart";
    sendBtn.dataset.value = "";
  } else {
    sendBtn.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
  }
}