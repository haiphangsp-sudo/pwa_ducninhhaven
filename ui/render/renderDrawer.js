
// ui/render/renderDrawer.js

import { translate } from "../utils/translate.js";
import { getVariantById } from "../../core/menuQuery.js";

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

  const cartLines = Array.isArray(state.cart?.items) ? state.cart.items : [];
  const activePlace = state.context?.active;

  titleEl.textContent = translate("cart_bar.cart_title");

  placeEl.textContent = activePlace?.label
    ? translate(activePlace.label)
    : activePlace?.id || translate("place.select");

  const lines = cartLines.map(line => {
    const info = getVariantById(line.id);
    if (!info) return null;

    const qty = Number(line.qty || 0);
    const price = Number(info.price || 0);

    return {
      id: line.id,
      qty,
      price,
      subtotal: qty * price,
      productLabel: info.productLabel,
      variantLabel: info.variantLabel
    };
  }).filter(Boolean);

  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
  const totalPrice = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const uniqueCount = lines.length;

  if (lines.length === 0) {
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

  totalEl.textContent = `${totalPrice.toLocaleString("vi-VN")} đ`;
  countEl.textContent = `${totalQty}`;
  uniqueEl.textContent = `${uniqueCount}`;

  itemsEl.innerHTML = lines.map(line => {
    const productName = line.productLabel ? translate(line.productLabel) : "";
    const variantName = line.variantLabel ? translate(line.variantLabel) : "";
    const itemName = variantName || productName || line.id;

    const priceText = line.price > 0
      ? `${line.price.toLocaleString("vi-VN")} đ`
      : line.price === 0
        ? translate("cart_bar.free")
        : translate("cart_bar.instant");

    return `
      <div class="drawer__item drawer-item">
        <div class="drawer__info">
          <strong>${itemName}</strong>
          ${productName && variantName && productName !== variantName
            ? `<span class="drawer__variant">${productName}</span>`
            : ""
          }
          <span class="text-s text-muted">${priceText}</span>
          <span class="text-s text-muted">
            ${translate("cart_bar.subtotal") || "Tạm tính"}: ${line.subtotal.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div class="drawer-qty row items-center gap-s">
          <button
            class="qty-btn min"
            type="button"
            data-action="update-qty"
            data-value="${line.id}"
            data-delta="-1">-</button>

          <span class="qty-val weight-600">${line.qty}</span>

          <button
            class="qty-btn plus"
            type="button"
            data-action="update-qty"
            data-value="${line.id}"
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