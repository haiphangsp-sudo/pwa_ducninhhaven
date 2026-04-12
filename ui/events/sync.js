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
import { renderAck, showToast } from "../render/renderAck.js";
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
    orders: { active: [], inactive: [], isBarExpanded: false },
    order: { action: null, line: null, status: "idle", at: null }
  };
}

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getPrevState() {
  return lastState
    ? JSON.parse(JSON.stringify(lastState))
    : createPrevState();
}

export function attachUI() {
  if (uiAttached) return;
  uiAttached = true;

  subscribe(syncUI);
  syncUI(getState());
}

async function syncUI(state) {
  const prevState = getPrevState();

  const overlayChanged = state.overlay?.view !== prevState.overlay?.view;
  const contextChanged = !isEqual(state.context, prevState.context);
  const panelChanged =
    state.panel?.view !== prevState.panel?.view ||
    state.panel?.option !== prevState.panel?.option;
  const cartChanged = !isEqual(state.cart?.items || [], prevState.cart?.items || []);
  const langChanged = state.lang?.current !== prevState.lang?.current;
  const ackChanged =
    state.ack?.visible !== prevState.ack?.visible ||
    state.ack?.message !== prevState.ack?.message ||
    state.ack?.status !== prevState.ack?.status;
  const ordersChanged = !isEqual(state.orders?.active || [], prevState.orders?.active || []);
  const statusBarExpandedChanged =
    state.orders?.isBarExpanded !== prevState.orders?.isBarExpanded;

  syncOverlayIfNeeded(state, overlayChanged);
  syncContextIfNeeded(state, contextChanged);
  syncPanelIfNeeded(state, panelChanged);
  syncCartIfNeeded(state, cartChanged);
  syncLanguageIfNeeded(state, langChanged);
  syncAckIfNeeded(state, ackChanged);
  syncStatusBarIfNeeded(state, ordersChanged, statusBarExpandedChanged, overlayChanged);

  await handleOrderLogic(state);
  syncOrderFeedback(state, prevState);

  lastState = JSON.parse(JSON.stringify(getState()));
}

function syncOverlayIfNeeded(state, overlayChanged) {
  if (!overlayChanged) return;

  switch (state.overlay?.view) {
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

  syncOverlay(state.overlay?.view || null);
}


function syncContextIfNeeded(state, contextChanged) {
  if (!contextChanged) return;

  renderNavBar(state);
  renderDrawer(state);
}

function syncPanelIfNeeded(state, panelChanged) {
  if (!panelChanged) return;

  eventHub(state);
  renderPanel(state);
}

function syncCartIfNeeded(state, cartChanged) {
  if (!cartChanged) return;

  renderCartBar(state);
  renderDrawer(state);
  localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart?.items || []));
}
function syncLanguageIfNeeded(state, langChanged) {
  if (!langChanged) return;

  localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);

  if (state.overlay?.view === "orderTrackerPage") {
    openOrderTracker();
  }

  if (state.overlay?.view === "cartDrawer") {
    renderDrawer(state);
  }

  if (state.overlay?.view === "placePicker") {
    renderPlacePicker(state);
  }
}

function syncAckIfNeeded(state, ackChanged) {
  if (!ackChanged) return;
  renderAck(state);
}

function syncStatusBarIfNeeded(state, ordersChanged, statusBarExpandedChanged, overlayChanged) {
  const trackerOpen = state.overlay?.view === "orderTrackerPage";
  const shouldRenderStatusBar =
    ordersChanged ||
    statusBarExpandedChanged ||
    (trackerOpen && overlayChanged);

  if (!shouldRenderStatusBar) return;

  renderStatusBar(state);
  openOrderTracker(state);
}

async function handleOrderLogic(state) {
  const { action, at } = state.order || {};

  const isNewCommand = action && at && at !== lastHandledOrderAt;
  if (!isNewCommand || isProcessingOrder) return;

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

      default:
        break;
    }
  } finally {
    isProcessingOrder = false;
  }
}

function syncOrderFeedback(state, prevState) {
  const orderChanged =
    state.order?.status !== prevState.order?.status ||
    state.order?.action !== prevState.order?.action ||
    state.order?.line !== prevState.order?.line ||
    state.order?.at !== prevState.order?.at;

  if (!orderChanged) return;

  switch (state.order?.status) {
    case "error":
      showToast({ type: "error", message: "cart_bar.error", duration: 2500 });
      break;

    case "duplicate":
      showToast({ type: "info", message: "cart_bar.duplicate", duration: 2500 });
      break;

    case "success":
      showToast({ type: "success", message: "cart_bar.success", duration: 2500 });
      break;

    case "sending":
      showToast({ type: "sending", message: "cart_bar.sending" });
      break;

    case "added":
      showToast({ type: "success", message: "cart_bar.added" });
      break;

    case "idle":
      showToast({ type: "idle", message: "cart_bar.idle" });
      break;

    default:
      break;
  }
}
