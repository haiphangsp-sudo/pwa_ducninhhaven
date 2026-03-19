
// ui/render/renderDrawer.js

import { updateCartBarTotal } from "./renderCart.js";
import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { sendCart } from "../../core/events.js";
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { MENU } from "../../core/menuStore.js";

export function openCartDrawer() {
  renderDrawer();
  showOverlay("cartDrawer");
}

function renderDrawer() {
  const sendLabel =
    UI.delivery.state === "sending"
      ? "delivery.pending"
      : "cart_bar.order";

  const sendBtn = document.getElementById("drawerSend");
  const titleEl = document.querySelector(".drawer-title");
  const itemsEl = document.getElementById("drawerItems");
  const closeBtn = document.getElementById("drawerClose");

  if (!sendBtn || !titleEl || !itemsEl || !closeBtn) return;

  sendBtn.textContent = translate(sendLabel);
  titleEl.textContent = translate("cart_bar.cart_title");

  itemsEl.innerHTML = "";

  UI.cart.items.forEach((cartItem, index) => {
    const itemId = getCartItemId(cartItem, index);

    const menuItem = MENU?.[cartItem.category]?.items?.[cartItem.item];
    const menuOption = menuItem?.options?.[cartItem.option];

    const itemLabel = translate(menuItem?.label || cartItem.item);
    const optionLabel = translate(menuOption?.label || "");

    const row = document.createElement("div");
    row.className = "drawer__item";
    row.dataset.id = itemId;

    row.innerHTML = `
      <div class="drawer__info">
        <strong>${itemLabel}</strong>
        <div>${optionLabel}</div>
      </div>

      <div class="drawer-qty">
        <button data-id="${itemId}" class="qty-minus center" type="button">−</button>
        <span class="qty">${cartItem.qty}</span>
        <button data-id="${itemId}" class="qty-plus center" type="button">+</button>
      </div>
    `;

    itemsEl.appendChild(row);
  });

  sendBtn.onclick = () => {
    sendCart();
    closeOverlay();
    itemsEl.innerHTML = "";
  };

  closeBtn.onclick = closeOverlay;
}

/* ---------- CLICK HANDLER ---------- */

export function attachCartDrawerEvents() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-plus, .qty-minus");
    if (!btn) return;

    const row = btn.closest(".drawer__item");
    if (!row) return;

    const id = btn.dataset.id;
    if (!id) return;

    const index = findCartItemIndexById(id);
    if (index === -1) return;

    const cartItem = UI.cart.items[index];
    if (!cartItem) return;

    // tăng số lượng
    if (btn.classList.contains("qty-plus")) {
      cartItem.qty += 1;
      syncDrawerRowQty(row, cartItem.qty);
      updateCartBarTotal();
      return;
    }

    // giảm số lượng
    if (btn.classList.contains("qty-minus")) {
      cartItem.qty -= 1;

      // nếu còn > 0 thì chỉ update dòng hiện tại
      if (cartItem.qty > 0) {
        syncDrawerRowQty(row, cartItem.qty);
        updateCartBarTotal();
        return;
      }

      // nếu về 0 thì xoá item khỏi cart
      UI.cart.items.splice(index, 1);

      // hết giỏ thì đóng drawer
      if (UI.cart.items.length === 0) {
        const itemsEl = document.getElementById("drawerItems");
        if (itemsEl) itemsEl.innerHTML = "";
        updateCartBarTotal();
        closeOverlay();
        return;
      }

      // còn item thì render lại toàn bộ drawer để đồng bộ data-id và UI
      renderDrawer();
      updateCartBarTotal();
    }
  });
}
/* ---------- HELPERS ---------- */

function syncDrawerRowQty(row, qty) {
  const qtyEl = row.querySelector(".qty");
  if (qtyEl) qtyEl.textContent = qty;
}

function findCartItemIndexById(id) {
  return UI.cart.items.findIndex((item, index) => {
    return String(getCartItemId(item, index)) === String(id);
  });
}

function getCartItemId(item, fallbackIndex = 0) {
  // nếu item đã có id thật thì dùng
  if (item?.id != null) return item.id;

  // fallback tạm thời để code chạy ngay cả khi dữ liệu cũ chưa có id
  return `${item.category}-${item.item}-${item.option}-${fallbackIndex}`;
}