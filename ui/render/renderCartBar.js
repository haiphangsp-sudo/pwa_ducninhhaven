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




/**
 * Hiển thị thanh trạng thái ở dưới cùng màn hình
 */
function StatusBar(state) {
  const statusBar = document.getElementById("statusBar");
  if (!statusBar) return;

  const { ack, cart, context } = state;
  const statusIcon = statusBar.querySelector(".status-icon");
  const statusText = statusBar.querySelector(".status-text");
  const cartInfo = statusBar.querySelector(".cart-info");

  // 1. Cập nhật thông tin Vị trí (Phòng/Bàn)
  const placeName = context.active?.name || "Chưa chọn vị trí";
  
  // 2. Logic hiển thị Trạng thái (Phụ thuộc vào state.ack)
  let statusHTML = "";
  let textHTML = placeName;

  switch (ack.status) {
    case "sending":
      statusHTML = `<div class="spinner-s"></div>`; // Biểu tượng xoay
      textHTML = "Đang gửi đơn hàng...";
      statusBar.className = "status-bar is-sending";
      break;

    case "success":
      statusHTML = "✅";
      textHTML = ack.message || "Gửi đơn thành công!";
      statusBar.className = "status-bar is-success";
      break;

    case "error":
      statusHTML = "⚠️";
      textHTML = "Lỗi kết nối. Đang chờ gửi bù...";
      statusBar.className = "status-bar is-error";
      break;

    case "added":
      statusHTML = "🛒";
      textHTML = "Đã thêm vào giỏ!";
      statusBar.className = "status-bar is-added";
      break;

    default:
      statusHTML = "📍";
      textHTML = placeName;
      statusBar.className = "status-bar is-idle";
      break;
  }

  // 3. Cập nhật giao diện
  statusIcon.innerHTML = statusHTML;
  statusText.textContent = textHTML;

  // 4. Cập nhật thông tin nhanh về Giỏ hàng (Cart Bubble)
  const totalQty = (cart.items || []).reduce((sum, i) => sum + i.qty, 0);
  if (totalQty > 0) {
    cartInfo.innerHTML = `<span class="badge">${totalQty}</span> món trong giỏ`;
    cartInfo.classList.remove("hidden");
  } else {
    cartInfo.classList.add("hidden");
  }
}

