// ui/events/globalEvents.js

import { setState, getState } from "../../core/state.js";
import { applyPlaceById } from "../../core/context.js";
import { dispatchAction } from "../../core/events.js";
import { attachDrawerEvents } from "../render/renderDrawer.js";
import { attachMenuEvents } from "../components/categoryOption.js";
import { attachPlacePickerEvents } from "../render/renderPlacePicker.js";
import { attachOrchestrator } from "../../core/events.js";


/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {
    attachMenuEvents();
    attachDrawerEvents();
    attachPlacePickerEvents();
    attachOrchestrator();

    document.addEventListener("click", handleGlobalClick);

    window.addEventListener("intentresume", (e) => {
        if (e.detail?.type === "send_cart") {
            setTimeout(() => {
                openCartDrawer();
            }, 300);
        }
    });

    window.addEventListener("contextchange", (e) => {
        dispatchAction({ mode: e.detail.mode });
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
      setState({ 
        view: { overlay: null },
        drawer: { item: null, qty: 1 } // Đóng là reset để lần sau mở ra luôn là 1
        });
      break;

    case "close-overlay":
        setState({ view: { overlay: null } });
        setState({ drawer: { item: null, qty: 1 }});//Đóng là reset để lần sau mở ra luôn là 1
      break;

    /* ---------- PLACE ---------- */

    case "select-place":
      if (!value) return;
      setState({ 
                context: { active: { id: value } },
                view: { overlay: null } 
            });
      applyPlaceById(value);
    break;

      /* ---------- CART / ORDER ---------- */
    case 'qty-plus':
        break;

    case 'qty-minus':
        break;

      case "cart":
          setState({ 
        cart: { items },
        view: { overlay: null, tempQty: 1 } // Reset lại số lượng về 1 cho lần sau
        });
          break;
      
    case "instant":
      dispatchAction({
        mode: action,
        category: target.dataset.category,
        item: target.dataset.item,
        option: value,
        qty: 1
      });
      setState({ cart: { items } });
      break;

    case "send_cart":
      dispatchAction({ mode: "send_cart" });
      break;

    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: value } });
      break;

    default:
      break;
  }
}    
