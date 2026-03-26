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
      setState({ panel: { view: value } });
      break;

    case "overlay":
      setState({ overlay: { view: value } });
      break;

    case "close-overlay":
      setState({ overlay: { view: null } });
      break;

      /* ---------- CART / ORDER ---------- */

    case "cart":
      setState({
        order: {
          type: "cart",
          line: {
            category: target.dataset.item,
            item: target.dataset.item,
            option: target.dataset.option,
            qty: 1
          }
        }
      });
      break;
    
    case "instant":
      const { action: ui, ...rest } = target.dataset;
      setState({
        order: {
          type: "instant",
          line: { ui,
            ...rest,
            qty: 1
          }
        }
      });
      break;

    case "send_cart":
      setState({
        order: {
          type: "send_cart",
          line: null
        }
      });
      break;
    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: value } });
      break;

    default:
      break;
  }
}    
