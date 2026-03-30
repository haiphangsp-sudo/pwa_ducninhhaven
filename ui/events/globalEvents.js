// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/events.js";
import { applyPlaceById, getActivePlaceId } from "../../core/context.js";
import { syncContextToState } from "../../core/state.js";
import { translate } from "../utils/translate.js";



/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {


  document.addEventListener("click", handleGlobalClick);

  window.addEventListener("contextchange", () => {syncContextToState();});
  
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
      setState({ overlay: { view: cmd.value } });
      break;

    case "close-overlay":
      setState({
        overlay: { view: null },
        ack: { state: "hidden" }
      });
      break;
    
    case "select-place":
      setState({
        overlay: { view: null }
      });
      applyPlaceById(cmd.value);
      break;


    /* ---------- CART / ORDER ---------- */
    case "add-cart":
      setOrder(cmd)
      break;

    case "instant":
      checkCart(cmd);
      break;

    case "send-cart":
      checkCart(cmd);
      break;
    
    case "update-qty":
      const delta = parseInt(cmd.option);
      updateCartQuantity(cmd.value, delta);
      break;
    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: cmd.value } });
      break;

    default:
      break;
  }
}
function checkCart(cmd) {
  if (getActivePlaceId()!==null) {
    setOrder(cmd);

  }else{
    setState({
      overlay: { view: "placePicker" }
    });
  }
}

function setOrder(cmd) {
  setState({
    order: {
      type: cmd.action,
      mode: cmd.option,
      line: cmd.value,
      status: cmd.extra,
      at: Date.now()
    }
  });
  // Cập nhật trạng thái 'sending' để renderStatusBar hiện spinner
}