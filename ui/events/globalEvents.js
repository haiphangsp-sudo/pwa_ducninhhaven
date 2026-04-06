// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/action.js";
import { applyPlaceById, syncContextToState } from "../../core/context.js";
import { animateFlyToCart } from "../../ui/interactions/animateFlyToCart.js";
import { applyScrollUI } from "./scrollBehavior.js";
import { syncOrdersWithServer } from "../../core/orders.js";
import { getState } from "../../core/state.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";



/* =========================
   MAIN EVENTS
========================= */

export function attachAppEvents() {

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("contextchange", () => { syncContextToState(); });
   let ticking = false;
    window.addEventListener("scroll", () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            applyScrollUI();
        ticking = false;
        });
        ticking = true;
    }
    });
  
  syncOrdersWithServer();
  // Polling mỗi 45 giây
    setInterval(() => {
        const { active } = getState().orders;
        if (active && active.some(o => o.status !== 'DONE')) {
            syncOrdersWithServer();
        }
    }, 45000);
  
   attachRuntimeRefresh({
        intervalMs: 60000,
        enableInterval: true
    });
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
      setState({
        overlay: { view: cmd.value }
      });
      break;

    case "close-overlay":
      setState({
        overlay: { view: null }
      });
      break;
    
    case "select-place":
      setState({
        overlay: { view: null }
      });
      applyPlaceById(cmd.value);
      break;

    /* ---------- CART / ORDER ---------- */
    case "add_cart":
      setOrder( cmd )
      animateFlyToCart(target);
      break;

    case "buy_now":
      setOrder(cmd);
      break;

    case "send_cart":
      setOrder(cmd);
      break;
    
    case "update-qty":
      const delta = parseInt(cmd.option);
      updateCartQuantity(cmd.value, delta);
      break;
    
    case "toggle_status":
      setState({
        orders: {
          isBarExpanded: cmd.value !== "true"? true : false
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

function setOrder(cmd) {
  setState({
    order: {
      action: cmd.action,
      line: cmd.value,
      status: cmd.extra,
      at: Date.now()
    }
  });
  // Cập nhật trạng thái 'sending' để renderStatusBar hiện spinner
}
