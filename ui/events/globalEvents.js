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
    case "instant":
    case "send_cart":
      setState({
        order: {
          type: action,
          line: value,
          status: "pending",
          at: Date.now()
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
