// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { translate } from "../utils/translate.js";
import { openCartDrawer } from "./renderDrawer.js";
import { getCartStats } from "../utils/cartHelpers.js"



/* =========================
   RENDER
========================= */

export function renderCartBar() {
  const bar = document.getElementById("cartBar");
  const btn = document.getElementById("cartOpen");
  const countEl = document.getElementById("cartCount");
  if (!bar || !btn || !countEl) return;
  
  const {isEmpty, textFull } = getCartStats();
  
  if (isEmpty) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  btn.textContent = translate("cart_bar.cart_title");
  countEl.textContent = textFull;
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