// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { attachPlacePickerEvents } from "../render/renderPlacePicker.js";
import { updateCartQuantity } from "../../core/events.js";




/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {
    attachPlacePickerEvents();

  document.addEventListener("click", handleGlobalClick);
}

/* =========================
   GLOBAL CLICK
========================= */

function handleGlobalClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const value = target.dataset.value;

  switch (action) {

    /* ---------- NAV ---------- */

    case "nav-menu":
      setState({ panel: { view: value } });
      break;

    case "open-overlay":
      setState({ overlay: { view: value } });
      break;

    case "close-overlay":
      setState({ overlay: { view: null } });
      break;

    /* ---------- CART / ORDER ---------- */
    
    case "cart":
      setState({
      order: {
        type: "cart", // Kích hoạt addToCart trong sync.js
        line: value   
      }
    });
      break;
    
    case "instant":
      setState({
      order: {
        type: "instant", // Kích hoạt buyNow trong sync.js
        line: value        // ID món ăn
      }
    });
      break;

    case "send_cart":
      setState({
        order: {
          type: "send_cart", // Kích hoạt sendCart trong sync.js
          line: null         // Không cần ID cụ thể vì gửi cả giỏ
        }
      });
      break;
    
    case "update-qty":
      const delta = parseInt(target.dataset.delta);
      updateCartQuantity(value, delta); // Gọi hàm từ events.js
      break;
    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: value } });
      break;

    default:
      break;
  }
}