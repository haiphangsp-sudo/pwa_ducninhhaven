// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { translate } from "../utils/translate.js";
import { getDrawerExtended } from "../../core/menuQuery.js";


/* =========================
   RENDER
========================= */

export function renderCartBar(state) {
  const isEmpty = state.cart.items.length === 0;
  const cart = getDrawerExtended(state);
  const cartBar = document.getElementById("cartBar");
  const btn = document.getElementById("cartOpen");
  const countEl = document.getElementById("cartCount");
  if (!cartBar || !btn || !countEl) return;
  
  
  
  if (isEmpty) {
    cartBar.classList.add("cart-bar--hidden");
  } else {
    cartBar.classList.remove("cart-bar--hidden");
    btn.textContent = translate("cart_bar.cart_title");
    countEl.textContent = cart.totalQtyFormat;
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

/* =========================
   SCROLL
========================= */
let lastY = window.scrollY;

export function handleScroll() {
  const currentY = window.scrollY;
  const delta = currentY - lastY;

  const cartBar = document.querySelector(".cart-bar");
  if (!cartBar) return;

  if (Math.abs(delta) < 5) return;

  if (delta > 0) {
    // scroll xuống
    cartBar.classList.add("cart-bar--hidden");
  } else {
    // scroll lên
    cartBar.classList.remove("cart-bar--hidden");
  }

  lastY = currentY;
}


