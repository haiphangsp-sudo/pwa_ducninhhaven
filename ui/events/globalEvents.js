// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/events.js";
import { applyPlaceById } from "../../core/context.js";
import { syncContextToState } from "../../core/state.js";
import { toggleStatusBar } from "../../ui/components/statusBar.js";
import { animateFlyToCart } from "../../ui/interactions/animateFlyToCart.js";
import { getUIFlags } from "../../data/helpers.js";


/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("contextchange", () => { syncContextToState(); });
  toggleStatusBar();
}

/* =========================
   GLOBAL CLICK
========================= */

function handleGlobalClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const { state, hasPlace, isCartEmpty, isSending } = getUIFlags();


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
      setState({ overlay: { view: cmd.value, source: sou } });
      break;

    case "close-overlay":
      setState({
        overlay: { view: null }
      });
      break;
    
    case "select-place":
      setState({
        overlay: { view: null, source: { ...state.source } }
      });
      applyPlaceById(cmd.value);
      break;

    /* ---------- CART / ORDER ---------- */
    case "add_cart":
      setOrder( cmd, hasPlace )
      animateFlyToCart(target);
      break;

    case "buy_now":
      checkCart(cmd, hasPlace, sou);
      break;

    case "send_cart":
      checkCart(cmd, hasPlace, sou);
      break;
    
    case "update-qty":
      const delta = parseInt(cmd.option);
      updateCartQuantity(cmd.value, delta);
      break;
    
    case "toggle_status":
      setState({
        orders: {
          active: [],
          inactive: [],
          isBarExpanded: isCartEmpty ? false : true
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
function checkCart( cmd, hasPlace, sou ) {
  if (hasPlace) {
    setOrder(cmd);

  }else{
    setState({
      overlay: { view: "placePicker",source: sou }
    });
  }
}

function setOrder(cmd, hasPlace) {
  setState({
    order: {
      action: cmd.action,
      hasPlace: hasPlace,
      line: cmd.value,
      status: cmd.extra,
      at: Date.now()
    }
  });
  // Cập nhật trạng thái 'sending' để renderStatusBar hiện spinner
}
