// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { attachDrawerEvents } from "../render/renderDrawer.js";
import { attachPlacePickerEvents } from "../render/renderPlacePicker.js";




/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {
    attachDrawerEvents();
    attachPlacePickerEvents();

    document.addEventListener("click", handleGlobalClick);

    window.addEventListener("intentresume", (e) => {
        if (e.detail?.type === "send_cart") {
            setTimeout(() => {
                openCartDrawer();
            }, 300);
        }
    });

  
    window.addEventListener("needplace", () => {
        setState({ view: { overlay: "placePicker" } });
    });
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
      setState({ view: { panel: value } });
      break;

    case "open-overlay":
      setState({ view: { overlay: value }});
      break;

    case "close-overlay":
        setState({ view: { overlay: null } });
      break;

      /* ---------- CART / ORDER ---------- */

    case "cart":          
    case "instant":
    case "send_cart":
      setState({ view: { cart: action } });
      break;

    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: value } });
      break;

    default:
      break;
  }
}    
