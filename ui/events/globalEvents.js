// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/events.js";


/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {

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
      setState({
        panel: {
          view: value,
          ui: target.dataset.ui
        }
      });
      break;

    case "open-overlay":
      setState({ overlay: { view: value } });
      break;

    case "close-overlay":
      setState({
        overlay: { view: null },
        ack: { state: "hidden" }
      });
      break;
    
    case "place-selected":
      setState({
        place: { selected: value },
        context: {
          anchor: value,
          active: "table",
          updatedAt: Date.now()
        },
        overlay: { view: null }
      });
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

/* =======================================================
   ORDER ORCHESTRATION
======================================================= */

async function syncOrderFlow(state) {
  const { type, line } = state.order || {};
  const activePlace = state.context.active;

  if (!type || isProcessingOrder) return;

  // 1. Kiểm tra vị trí (Chỉ đơn gửi đi mới cần)
  if (type === "instant" || type === "send_cart") {
    if (!activePlace?.id) {
      if (state.overlay.view !== "placePicker") {
        setState({ overlay: { view: "placePicker" } });
      }
      return; 
    }
  }

  // 2. Thực thi Action
  isProcessingOrder = true;
  
  // Hiện loading nếu cần gửi qua API
  if (type !== "cart") {
    setState({ ack: { state: "show", status: "sending" } });
  }

  try {
    switch (type) {
      case "cart":
        if (line) addToCart(line);
        break;
      case "instant":
        if (line) await buyNow(line); // Hàm này gọi finalizeOrderSuccess('instant')
        break;
      case "send_cart":
        await sendCart(); // Hàm này gọi finalizeOrderSuccess('cart')
        break;
    }
  } catch (error) {
    setState({ ack: { state: "show", status: "error" } });
  } finally {
    // 3. Giải phóng State
    setState({ order: { type: null, line: null } });
    isProcessingOrder = false;
  }
}
