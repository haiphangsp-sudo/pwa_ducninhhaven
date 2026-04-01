// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/events.js";
import { applyPlaceById, getActivePlaceId } from "../../core/context.js";
import { syncContextToState } from "../../core/state.js";
import { statutBarEvent } from "../render/renderStatusBar.js";
import { toggleStatusBar } from "../../ui/components/statusBar.js";





/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("contextchange", () => { syncContextToState(); });
  statutBarEvent();
  toggleStatusBar();
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
      setState({ overlay: { view: cmd.value , source: cmd.action} });
      break;

    case "close-overlay":
      setState({
        overlay: { view: null }
      });
      break;
    
    case "select-place":
      setState({
        overlay: { view: null,source: "" }
      });
      applyPlaceById(cmd.value);
      break;

    /* ---------- CART / ORDER ---------- */
    case "add_cart":
      setOrder(cmd,cmd.action)
      break;

    case "buy_now":
      checkCart(cmd,cmd.action);
      break;

    case "send_cart":
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
function checkCart(cmd,s) {
  if (getActivePlaceId()!==null) {
    setOrder(cmd);

  }else{
    setState({
      overlay: { view: "placePicker",source:s }
    });
  }
}

function setOrder(cmd) {
  setState({
    order: {
      action: cmd.action,
      mode: cmd.option,
      line: cmd.value,
      status: cmd.extra,
      at: Date.now()
    }
  });
  // Cập nhật trạng thái 'sending' để renderStatusBar hiện spinner
}