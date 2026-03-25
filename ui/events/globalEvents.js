// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { applyPlaceById } from "../../core/context.js";
import { addToCart, sendCart } from "../../core/events.js";
import { attachDrawerEvents } from "../render/renderDrawer.js";
import { attachPlacePickerEvents } from "../render/renderPlacePicker.js";
import { attachOrchestrator } from "../../core/events.js";
import { openCartDrawer } from "../render/renderDrawer.js";
import { bounceCartBar } from "../render/renderCartBar.js";



/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {
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

async function handleGlobalClick(e) {
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

    case "cart":          
      bounceCartBar();
      addToCart([singleItemArray(target)]);
    break;

    case "instant":
      sendInstant([singleItemArray(target)]);
      break;

    case "send_cart":
      await sendCart();
      break;

    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: value } });
      break;

    default:
      break;
  }
}    

/* =========================
   PRIVATE
========================= */

function singleItemArray(target) {
  return {
    mode: target.dataset.mode,
    category: target.dataset.category,
    item: target.dataset.item,
    option: target.dataset.option,
    qty: 1
  }
}
