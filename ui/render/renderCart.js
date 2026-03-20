// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { openCartDrawer } from "./renderDrawer.js";

/* =========================
   RENDER
========================= */

export function renderCartBar() {
  const bar = document.getElementById("cartBar");
  const btn = document.getElementById("cartOpen");

  if (!bar || !btn) return;

  const total = getCartTotal();

  // hide nếu không có item
  if (total === 0) {
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");

  btn.textContent = translate("cart_bar.cart_title");

  updateCartBarTotal(total);
}

/* =========================
   UPDATE
========================= */

export function updateCartBarTotal(total) {
  if (!total) total = getCartTotal();
  const countEl = document.getElementById("cartCount");
  const drawerTotal = document.querySelector(".drawer-total");

  const label =
    total > 1
      ? `${total} ${translate("cart_bar.items")}`
      : `${total} ${translate("cart_bar.item")}`;

  if (countEl) countEl.textContent = label;
  if (drawerTotal) drawerTotal.textContent = label;
}

/* =========================
   EVENTS
========================= */

let attached = false;

export function attachCartBarEvents() {
  if (attached) return;
  attached = true;

  document.addEventListener("click", handleCartBarClick);
}

function handleCartBarClick(e) {
  const btn = e.target.closest("#cartOpen");
  if (!btn) return;
  
  showOverlay("cartDrawer");
  openCartDrawer();
}

/* =========================
   HELPERS
========================= */

function getCartTotal() {
  return UI.cart.items.reduce((a, b) => a + b.qty, 0);
}

/* =========================
   EFFECT
========================= */

export function bounceCartBar() {
  const bar = document.getElementById("cartBar");
  if (!bar) return;

  bar.classList.add("cart-bounce");

  setTimeout(() => {
    bar.classList.remove("cart-bounce");
  }, 400);
}