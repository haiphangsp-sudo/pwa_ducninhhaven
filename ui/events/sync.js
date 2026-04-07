// ui/sync.js
import { subscribe, getState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub, eventHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { renderAck } from "../render/renderAck.js";
import { openOrderTracker } from "../components/orderTracker.js";

let lastState = null;
let isProcessingOrder = false;
let lastHandledOrderAt = null;
let uiAttached = false;

function createPrevState() {
  return {
    overlay: { view: null },
    context: {},
    panel: { view: null, option: null },
    cart: { items: [] },
    lang: { current: "vi" },
    ack: { visible: false, status: null, message: "" },
    orders: { active: [], isBarExpanded: false },
    order: { action: null, line: null, status: "idle", at: null }
  };
}

export function attachUI() {
  if (uiAttached) return;
  uiAttached = true;

  subscribe(syncUI);
  syncUI(getState());
}

async function syncUI(state) {
  const prevState = lastState
    ? JSON.parse(JSON.stringify(lastState))
    : createPrevState();

  const hasOrderChange = JSON.stringify(state.orders.active) !== JSON.stringify(prevState.orders?.active);
  const hasExpandChange = state.orders.isBarExpanded !== prevState.orders?.isBarExpanded;

  if (hasOrderChange || hasExpandChange) {
    renderStatusBar(state);
  }

  const activeId = state.overlay.view;
  if (activeId !== prevState.overlay.view) {
    switch (activeId) {
      case "cartDrawer":
        renderDrawer(state);
        break;
      case "placePicker":
        renderPlacePicker(state);
        break;
      case "orderTrackerPage":
        openOrderTracker(state);
        break;
      default:
        break;
    }
    syncOverlay(activeId);
  }

  if (JSON.stringify(state.context) !== JSON.stringify(prevState.context)) {
    renderNavBar(state);
    renderDrawer(state);
  }

  if (state.panel.view !== prevState.panel.view) {
    renderPanel(state);
    eventHub(state);
  }

  const cartChanged =
    JSON.stringify(state.cart.items || []) !==
    JSON.stringify(prevState.cart.items || []);

  if (cartChanged) {
    renderCartBar(state);
    renderDrawer(state);
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart.items || []));
  }

  if (state.lang.current !== prevState.lang.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
    syncLanguage(state);
  }

  if (
    state.ack.visible !== prevState.ack.visible ||
    state.ack.message !== prevState.ack.message ||
    state.ack.status !== prevState.ack.status
  ) {
    renderAck(state);
  }

  if (state.overlay.view === "orderTrackerPage") {
    openOrderTracker(state);
  }
  

  await handleOrderLogic(state, prevState);

  lastState = JSON.parse(JSON.stringify(getState()));
}

function syncLanguage(state) {
  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
}
async function handleOrderLogic(state) {
  const { action, at, status } = state.order;

  const isNew =
    action &&
    at &&
    at !== lastHandledOrderAt;

  if (!isNew || isProcessingOrder) return;

  lastHandledOrderAt = at;
  isProcessingOrder = true;

  try {
    switch (action) {
      case "add_cart":
        addToCart();
        break;

      case "buy_now":
      case "send_cart":
        await submitOrder(action);
        break;
    }
  } finally {
    isProcessingOrder = false;
  }
}