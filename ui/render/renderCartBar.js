// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { translate } from "../utils/translate.js";


/* =========================
   RENDER
========================= */

export function renderCartBar(state) {

  const cart = getCartExtended(state);
  const bar = document.getElementById("cartBar");
  const btn = document.getElementById("cartOpen");
  const countEl = document.getElementById("cartCount");
  if (!bar || !btn || !countEl) return;
  
  
  if (cart.isEmpty) {
    bar.classList.add("hidden");
  } else {
    bar.classList.remove("hidden");
    btn.textContent = translate("cart_bar.cart_title");
    countEl.textContent = cart.totalQty > 1
      ? `${cart.totalQty} ${translate("cart_bar.items")}`
      : `${cart.totalQty} ${translate("cart_bar.item")}`
  }
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

export function loadingCartBar() {
  const target = document.getElementById("cartBar");
  target.classList.add("is-loading");
  setTimeout(() => target.classList.remove("is-loading"), 500);
}