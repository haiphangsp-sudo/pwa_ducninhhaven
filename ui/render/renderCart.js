// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { getCartTotals, textItemItems } from "../utils/cartCalculators.js";
import { translate } from "../utils/translate.js";
import { openCartDrawer } from "./renderDrawer.js";
import { UI } from "../../core/state.js"



/* =========================
   RENDER
========================= */

export function renderCartBar() {
  const bar = document.getElementById("cartBar");
  const btn = document.getElementById("cartOpen");

  if (!bar || !btn) return;
  const cartItems = UI.cart.items;
  if (getCartTotals(cartItems).isEmpty) {
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");

  btn.textContent = translate("cart_bar.cart_title");

  updateCartBarTotal();
}

/* =========================
   UPDATE
========================= */

export function updateCartBarTotal() {
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;
  countEl.textContent = textItemItems();
}

/* =========================
   EVENTS
========================= */

export function attachCartBarEvents() {
  const btn = document.getElementById("cartOpen");
  if (!btn) return;
  btn.onclick = openCartDrawer;
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