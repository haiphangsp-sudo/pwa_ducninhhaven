// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { translate } from "../utils/translate.js";
import { getDrawerExtended } from "../../core/menuQuery.js";


/* =========================
   RENDER
========================= */

export function renderCartBar(state) {

  const cart = getDrawerExtended();
  const bar = document.getElementById("cartBar");
  const btn = document.getElementById("cartOpen");
  const countEl = document.getElementById("cartCount");
  if (!bar || !btn || !countEl) return;
  
  
  if (cart.isEmpty) {
    bar.classList.add("hidden");
  } else {
    bar.classList.remove("hidden");
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

// ui/events/scrollBehavior.js

let lastScrollTop = 0;
const threshold = 10; // Khoảng cách cuộn tối thiểu để kích hoạt (tránh rung lắc)

export function initSmartHeader() {
    const contextBar = document.getElementById('cartBar');
    if (!contextBar) return;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Bỏ qua nếu cuộn quá ít
        if (Math.abs(lastScrollTop - scrollTop) <= threshold) return;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // CUỘN XUỐNG: Ẩn thanh bar
            contextBar.classList.add('cart-bar--hidden');
        } else {
            // CUỘN LÊN: Hiện thanh bar
            contextBar.classList.remove('cart-bar--hidden');
        }

        lastScrollTop = scrollTop;
    }, { passive: true }); // Tối ưu hiệu suất cuộn
}

