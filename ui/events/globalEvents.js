// ui/events/globalEvents.js

import { setState, syncContextToState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/events.js";
import { applyPlaceById } from "../../core/context.js";
import { animateFlyToCart } from "../../ui/interactions/animateFlyToCart.js";

/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("contextchange", () => { syncContextToState(); });
}

/* =========================
   GLOBAL CLICK
========================= */

function handleGlobalClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const cmd = {
    action: target.dataset.action,
    value: target.dataset.value,
    option: target.dataset.option,
    extra: target.dataset.extra
  };
  const sou = cmd.action;


  switch (cmd.action) {

    /* ---------- NAV ---------- */

    case "open-panel":
      setState({
        panel: {
          view: cmd.value,
          option: cmd.option
        }
      });
      break;

    case "open-overlay":
      setState({
        overlay: { view: cmd.value }
      });
      break;

    case "close-overlay":
      setState({
        overlay: { view: null }
      });
      break;
    
    case "select-place":
      setState({
        overlay: { view: null }
      });
      applyPlaceById(cmd.value);
      break;

    /* ---------- CART / ORDER ---------- */
    case "add_cart":
      setOrder( cmd )
      animateFlyToCart(target);
      break;

    case "buy_now":
      setOrder(cmd);
      break;

    case "send_cart":
      setOrder(cmd);
      break;
    
    case "update-qty":
      const delta = parseInt(cmd.option);
      updateCartQuantity(cmd.value, delta);
      break;
    
    case "toggle_status":
      setState({
        orders: {
          isBarExpanded: cmd.value !== "true"? true : false
        }
    });
       e.stopPropagation();
      break;

    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: cmd.value } });
      break;

    default:
      break;
  }
}

function setOrder(cmd) {
  setState({
    order: {
      action: cmd.action,
      line: cmd.value,
      status: cmd.extra,
      at: Date.now()
    }
  });
  // Cập nhật trạng thái 'sending' để renderStatusBar hiện spinner
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