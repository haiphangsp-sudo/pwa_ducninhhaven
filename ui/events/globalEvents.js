// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/events.js";


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
    extra: target.dataset.extra,
    source: "global"
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
        place: {
          selected: cmd.value,
          type: cmd.option
        },
        context: {
          anchor: context?.anchor,
          active: {id: cmd.value},
          updatedAt: Date.now()
        },
        overlay: { view: null }
      });
      break;


    /* ---------- CART / ORDER ---------- */
    case "add-cart":
      setOrder(cmd)
      break;

    case "send-instant":
      checkCartPlace(cmd);
      break;

    case "send_cart":
      checkCartPlace(cmd);
      break;
    
    case "update-qty":
      const delta = parseInt(cmd.option);
      updateCartQuantity(cmd.value, delta); // Gọi hàm từ events.js
      break;
    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: cmd.value } });
      break;

    default:
      break;
  }
}
function checkCartPlace(cmd) {
  if (!state.context.active?.id) {
    setState({
      order: { ...state.order, status: "waiting_place", msg: translate("place.required") },
      overlay: { view: "placePicker" }
    });
  }else{
    setOrder(cmd);
  }
}

function setOrder(cmd) {
  setState({
    order: {
      type: cmd.action,
      line: cmd.value,
      status: cmd.extra,
      at: Date.now()
    }
  });
}