// ui/events/globalEvents.js
import { setState, getState } from "../../core/state.js";
import { queueOrderCommand } from "../../core/events.js";
import { updateCartQuantity } from "../../core/action.js";
import { applyPlaceById, syncContextToState } from "../../core/context.js";
import { animateFlyToCart } from "../../ui/interactions/animateFlyToCart.js";
import { applyScrollUI } from "./scrollBehavior.js";
import { syncOrdersWithServer } from "../../core/orders.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";

let orderPollingStarted = false;
let fastSyncTimer = null;
let appEventsAttached = false;

export function attachAppEvents() {
  if (appEventsAttached) return;
  appEventsAttached = true;

  document.addEventListener("click", handleGlobalClick);

  window.addEventListener("contextchange", () => {
    syncContextToState();
  });

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

  if (!orderPollingStarted) {
    orderPollingStarted = true;

    syncOrdersWithServer();

    fastSyncTimer = setInterval(() => {
      const { active } = getState().orders || {};
      const hasSyncing = active?.some(o => o.status === "SYNCING");

      if (hasSyncing) {
        syncOrdersWithServer();
      } else {
        clearInterval(fastSyncTimer);
      }
    }, 5000);

    setInterval(() => {
      const { active } = getState().orders || {};
      const hasActive = active?.some(
        o => !["DONE", "RECOVERING", "CANCELED"].includes(o.status)
      );

      if (hasActive) {
        syncOrdersWithServer();
      }
    }, 45000);
  }

  attachRuntimeRefresh({
    intervalMs: 60000,
    enableInterval: true
  });
}

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

    case "add_cart":
      queueOrderCommand("add_cart", cmd.value);
      animateFlyToCart(target);
      break;

    case "buy_now":
      queueOrderCommand("buy_now", cmd.value);
      break;

    case "send_cart":
      queueOrderCommand("send_cart");
      break;

    case "update-qty":
      updateCartQuantity(cmd.value, parseInt(cmd.option, 10));
      break;

    case "toggle_status":
      setState({
        orders: {
          isBarExpanded: cmd.value !== "true"
        }
      });
      e.stopPropagation();
      break;

    case "change-lang":
      setState({
        lang: { current: cmd.value }
      });
      break;

    default:
      break;
  }
}