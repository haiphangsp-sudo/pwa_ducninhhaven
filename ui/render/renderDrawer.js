
import { updateCartBarTotal } from "./renderCart.js";
import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { addToCart, sendCart, updateCart } from "../../core/events.js";
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { MENU } from "../../core/menuStore.js";

let attached = false;

export function openCartDrawer() {
  renderDrawer();
  showOverlay("cartDrawer");
}

export function attachDrawerEvents() {
  if (attached) return;
  attached = true;

  document.addEventListener("click", handleDrawerClick);
}

function renderDrawer() {
  const sendBtn = document.getElementById("drawerSend");
  const titleEl = document.querySelector(".drawer-title");
  const itemsEl = document.getElementById("drawerItems");
  const closeBtn = document.getElementById("drawerClose");

  if (!sendBtn || !titleEl || !itemsEl || !closeBtn) return;

  titleEl.textContent = translate("cart_bar.cart_title");
  sendBtn.textContent = UI.cart.changed
    ? translate("cart_bar.confirm")
    : translate("cart_bar.order");

  itemsEl.innerHTML = UI.cart.items.map((cartItem, index) => {
    const lineId = getLineId(cartItem, index);

    const menuItem = MENU?.[cartItem.category]?.items?.[cartItem.item];
    const menuOption = menuItem?.options?.[cartItem.option];

    const itemLabel = translate(menuItem?.label || cartItem.item);
    const optionLabel = translate(menuOption?.label || "");

    return `
      <div class="drawer__item" data-line-id="${lineId}">
        <div class="drawer__info">
          <strong>${itemLabel}</strong>
          <div>${optionLabel}</div>
        </div>

        <div class="drawer-qty">
          <button data-action="minus" data-line-id="${lineId}" class="qty-minus center" type="button">−</button>
          <span class="qty">${cartItem.qty}</span>
          <button data-action="plus" data-line-id="${lineId}" class="qty-plus center" type="button">+</button>
        </div>
      </div>
    `;
  }).join("");

  sendBtn.onclick = handleSend;
  closeBtn.onclick = closeOverlay;
}

function handleDrawerClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const lineId = btn.dataset.lineId;
  if (!lineId) return;

  const index = findIndexByLineId(lineId);
  if (index === -1) return;

  const item = UI.cart.items[index];
  if (!item) return;

  const row = btn.closest(".drawer__item");

  if (action === "plus") {
    addToCart(item, 1);

    const nextIndex = findIndexByLineId(lineId);
    const nextItem = UI.cart.items[nextIndex];

    if (nextItem && row) {
      updateDrawerRowQty(row, nextItem.qty);
    }

    refreshDrawerAction();
    updateCartBarTotal();
    return;
  }

  if (action === "minus") {
    addToCart(item, -1);

    if (UI.cart.items.length === 0) {
      clearDrawer();
      updateCartBarTotal();
      closeOverlay();
      return;
    }

    const nextIndex = findIndexByLineId(lineId);

    if (nextIndex !== -1) {
      const nextItem = UI.cart.items[nextIndex];
      if (nextItem && row) {
        updateDrawerRowQty(row, nextItem.qty);
      }
    } else {
      renderDrawer();
    }

    refreshDrawerAction();
    updateCartBarTotal();
  }
}

function handleSend() {
  if (UI.cart.changed) {
    updateCart();
    renderDrawer();
    closeOverlay();
    return;
  }

  sendCart();
  clearDrawer();
  closeOverlay();
}

function refreshDrawerAction() {
  const sendBtn = document.getElementById("drawerSend");
  if (!sendBtn) return;

  sendBtn.textContent = UI.cart.changed
    ? translate("cart_bar.confirm")
    : translate("cart_bar.order");
}

function updateDrawerRowQty(row, qty) {
  const qtyEl = row.querySelector(".qty");
  if (qtyEl) qtyEl.textContent = qty;
}

function clearDrawer() {
  const itemsEl = document.getElementById("drawerItems");
  if (itemsEl) itemsEl.innerHTML = "";
}

function findIndexByLineId(id) {
  return UI.cart.items.findIndex((item, index) =>
    String(getLineId(item, index)) === String(id)
  );
}

function getLineId(item, fallbackIndex = 0) {
  if (item?.lineId) return item.lineId;
  return `${item.category}-${item.item}-${item.option}-${fallbackIndex}`;
}