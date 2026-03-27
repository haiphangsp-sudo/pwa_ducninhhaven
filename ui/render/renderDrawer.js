import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

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

  const cartItems = Array.isArray(state.cart?.items) ? state.cart.items : [];
  const activePlace = state.context?.active;

  titleEl.textContent = translate("cart_bar.cart_title");

  placeEl.textContent = activePlace?.id
    ? activePlace.id
    : translate("place.select");

  const displayItems = cartItems
    .map(line => {
      const info = getItemById(line.id);
      if (!info) return null;

      const qty = Number(line.qty || 0);
      const price = Number(info.price || 0);
      const subtotal = qty * price;

      return {
        id: line.id,
        qty,
        price,
        subtotal,
        itemLabel: info.itemLabel,
        optionLabel: info.optionLabel,
        fullName: info.fullName
      };
    })
    .filter(Boolean);

  const totalQty = displayItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = displayItems.reduce((sum, item) => sum + item.subtotal, 0);
  const uniqueCount = displayItems.length;

  totalEl.textContent = `${totalPrice.toLocaleString("vi-VN")} đ`;
  countEl.textContent = `${totalQty} ${totalQty > 1 ? translate("cart_bar.items") : translate("cart_bar.item")}`;
  uniqueEl.textContent = `${uniqueCount} ${translate("cart_bar.lines") || "món"}`;

  if (displayItems.length === 0) {
    summaryEl.classList.add("hidden");

    itemsEl.innerHTML = `
      <div class="p-m center text-muted">
        ${translate("cart_bar.empty")}
      </div>
    `;

    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "cartDrawer";
    sendBtn.disabled = false;
    return;
  }

  summaryEl.classList.remove("hidden");

  itemsEl.innerHTML = displayItems.map(item => {
    const itemName =
      item.fullName?.[state.lang?.current] ||
      item.fullName?.vi ||
      item.optionLabel?.[state.lang?.current] ||
      item.optionLabel?.vi ||
      item.id;

    const itemPrice =
      item.price > 0
        ? `${item.price.toLocaleString("vi-VN")} đ`
        : translate("cart_bar.free");

    return `
      <div class="drawer__item drawer-item">
        <div class="drawer__info">
          <strong>${itemName}</strong>
          <span class="text-s text-muted">${itemPrice}</span>
          <span class="text-s text-muted">
            ${translate("cart_bar.subtotal") || "Tạm tính"}: ${item.subtotal.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div class="drawer-qty row items-center gap-s">
          <button
            class="qty-btn min"
            type="button"
            data-action="update-qty"
            data-option-id="${item.id}"
            data-delta="-1">-</button>
          <span class="qty-val weight-600">${item.qty}</span>
          <button
            class="qty-btn plus"
            type="button"
            data-action="update-qty"
            data-option-id="${item.id}"
            data-delta="1"
          >+</button>
        </div>
      </div>
    `;
  }).join("");

  if (activePlace?.id) {
    sendBtn.textContent = translate("cart_bar.send_order");
    sendBtn.dataset.action = "send_cart";
    sendBtn.dataset.value = "";
    sendBtn.disabled = false;
  } else {
    sendBtn.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
    sendBtn.disabled = false;
  }
}