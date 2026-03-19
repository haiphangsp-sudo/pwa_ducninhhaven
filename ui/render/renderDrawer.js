//     ui/render/renderDrawer.js
 
import { updateCartBarTotal } from "./renderCart.js";
import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";
import { sendCart, updateCart } from "../../core/events.js";
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { MENU } from "../../core/menuStore.js";

/* =========================
   PUBLIC
========================= */

export function openCartDrawer() {
  renderDrawer();
  showOverlay("cartDrawer");
}

/* =========================
   RENDER
========================= */

function renderDrawer() {
  const sendBtn = document.getElementById("drawerSend");
  const titleEl = document.querySelector(".drawer-title");
  const itemsEl = document.getElementById("drawerItems");
  const closeBtn = document.getElementById("drawerClose");

  if (!sendBtn || !titleEl || !itemsEl || !closeBtn) return;

  const sendLabel =
    UI.delivery.state === "sending"
      ? "delivery.pending"
      : "cart_bar.order";

  sendBtn.textContent = translate(sendLabel);
  titleEl.textContent = translate("cart_bar.cart_title");

  itemsEl.innerHTML = UI.cart.items.map((cartItem, index) => {
    const itemId = getLineId(cartItem, index);

    const menuItem = MENU?.[cartItem.category]?.items?.[cartItem.item];
    const menuOption = menuItem?.options?.[cartItem.option];

    return `
      <div class="drawer__item" data-line-id="${itemId}">
        <div class="drawer__info">
          <strong>${translate(menuItem?.label || cartItem.item)}</strong>
          <div>${translate(menuOption?.label || "")}</div>
        </div>

        <div class="drawer-qty">
          <button data-action="minus" data-line-id="${itemId}" class="center">−</button>
          <span class="qty">${cartItem.qty}</span>
          <button data-action="plus" data-line-id="${itemId}" class="center">+</button>
        </div>
      </div>
    `;
  }).join("");

  sendBtn.onclick = handleSend;
  closeBtn.onclick = closeOverlay;
}

/* =========================
   UPDATE
========================= */

function updateDrawerRowQty(row, qty) {
  const el = row.querySelector(".qty");
  if (el) el.textContent = qty;
}

/* =========================
   EVENTS
========================= */

let attached = false;

export function attachDrawerEvents() {
  if (attached) return;
  attached = true;

  document.addEventListener("click", handleDrawerClick);
}

function handleDrawerClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.lineId;

  if (!id) return;

  const index = findIndexByLineId(id);
  if (index === -1) return;

  const item = UI.cart.items[index];
  if (!item) return;

  const row = btn.closest(".drawer__item");

  if (action === "plus") {
    item.qty += 1;
    updateDrawerRowQty(row, item.qty);
    updateCartBarTotal();
    return;
  }

  if (action === "minus") {
    item.qty -= 1;

    if (item.qty > 0) {
      updateDrawerRowQty(row, item.qty);
      updateCartBarTotal();
      return;
    }

    UI.cart.items.splice(index, 1);

    if (UI.cart.items.length === 0) {
      clearDrawer();
      updateCartBarTotal();
      closeOverlay();
      return;
    }

    renderDrawer(); // cần rebuild khi xoá
    updateCartBarTotal();
  }
}

/* =========================
   ACTIONS
========================= */
function handleSend() {
  if (UI.cart.changed) {
    updateCart(); 
    closeOverlay();
    return;
  }

  sendCart();    
  closeOverlay();
}


function clearDrawer() {
  const el = document.getElementById("drawerItems");
  if (el) el.innerHTML = "";
}

/* =========================
   HELPERS
========================= */

function findIndexByLineId(id) {
  return UI.cart.items.findIndex((item, index) =>
    String(getLineId(item, index)) === String(id)
  );
}

function getLineId(item, fallbackIndex = 0) {
  if (item?.lineId) return item.lineId;
  return `${item.category}-${item.item}-${item.option}-${fallbackIndex}`;
}

