// ui/events/globalEvents.js

import { getState, setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/action.js";
import { applyPlaceById, syncContextToState } from "../../core/context.js";
import { animateFlyToCart } from "../../ui/interactions/animateFlyToCart.js";
import { applyScrollUI } from "./scrollBehavior.js";
import { syncOrdersWithServer } from "../../core/orders.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";

let orderPollingStarted = false;

export function attachAppEvents() {
  document.addEventListener("click", handleGlobalClick);

  window.addEventListener("contextchange", syncContextToState);
  window.addEventListener("scroll", handleScroll, { passive: true });

  startOrderPolling();
  attachRuntimeRefresh({
    intervalMs: 60000,
    enableInterval: true
  });
}

function handleScroll() {
  if (handleScroll.ticking) return;

  handleScroll.ticking = true;
  requestAnimationFrame(() => {
    applyScrollUI();
    handleScroll.ticking = false;
  });
}


function handleGlobalClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const cmd = readCommand(target);

  if (handlePanelAction(cmd)) return;
  if (handleOverlayAction(cmd)) return;
  if (handlePlaceAction(cmd)) return;
  if (handleOrderAction(cmd, target)) return;
  if (handleCartAction(cmd)) return;
  if (handleStatusAction(cmd)) return;
  if (handleLanguageAction(cmd)) return;
}

function readCommand(target) {
  return {
    action: target.dataset.action,
    value: target.dataset.value,
    option: target.dataset.option,
    extra: target.dataset.extra
  };
}

function handlePanelAction(cmd) {
  if (cmd.action !== "open-panel") return false;

  setState({
    panel: {
      view: cmd.value,
      option: cmd.option
    }
  });

  return true;
}

function handleOverlayAction(cmd) {
  if (cmd.action === "open-overlay") {
    setState({ overlay: { view: cmd.value } });
    return true;
  }

  if (cmd.action === "close-overlay") {
    setState({ overlay: { view: null } });
    return true;
  }

  return false;
}

function handlePlaceAction(cmd) {
  if (cmd.action !== "select-place") return false;

  setState({ overlay: { view: null } });
  applyPlaceById(cmd.value);
  return true;
}

function handleOrderAction(cmd, target) {
  if (!["add_cart", "buy_now", "send_cart"].includes(cmd.action)) return false;

  setOrderCommand(cmd);

  if (cmd.action === "add_cart") {
    animateFlyToCart(target);
  }

  return true;
}

function handleCartAction(cmd) {
  if (cmd.action !== "update-qty") return false;

  const delta = parseInt(cmd.option, 10);
  if (Number.isNaN(delta)) return true;

  updateCartQuantity(cmd.value, delta);
  return true;
}

function handleStatusAction(cmd) {
  if (cmd.action !== "toggle_status") return false;

  const state = getState();

  setState({
    orders: {
      ...state.orders,
      isBarExpanded: cmd.value !== "true"
    }
  });

  return true;
}

function handleLanguageAction(cmd) {
  if (cmd.action !== "change-lang") return false;

  setState({
    lang: { current: cmd.value }
  });

  return true;
}

function setOrderCommand(cmd) {
  setState({
    order: {
      action: cmd.action,
      line: cmd.value || null,
      status: cmd.option || "idle",
      at: Date.now()
    }
  });
}
// ui/events/globalEvents.js

function startOrderPolling() {
  if (orderPollingStarted) return;
  orderPollingStarted = true;

  setInterval(() => {
    const state = getState();
    const active = state.orders?.active || [];
    const isViewingOrders = state.overlay?.view === "orderTrackerPage"; // Khách đang mở trang Orders
    const hasActive = active.some(o => !["DONE", "CANCELED"].includes(o.status));

    if (hasActive) {
      if (isViewingOrders) {
        // Nếu đang mở trang: Cập nhật nhanh (15-20s)
        syncOrdersWithServer();
      }
    }
  }, 15000); 
}

