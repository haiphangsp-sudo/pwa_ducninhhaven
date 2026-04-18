

import { subscribe, getState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../interactions/backdropManager.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub, eventHub } from "../render/renderHub.js";
import { eventPanelLang, showPanel } from "../render/renderPanel.js";
import { addToCart, processOrder } from "../../core/events.js";
import { renderAck, switchToast } from "../render/renderAck.js";
import { openOrderTracker } from "../components/orderTracker.js";
import { renderItemDetail } from "../render/renderItemDetail.js";
import { bootstrapOrderTracker, startOrderPolling } from "./appFlow.js";
import { setupEventListeners } from "./globalEvents.js";
import { getLocationInfo } from "../../core/placesQuery.js";

let lastState = null;
let isProcessingOrder = false;
let lastHandledOrderAt = null;
let uiAttached = false;

function createPrevState() {
  return {
    overlay: { view: null, value: null },
    context: {},
    panel: { view: null, option: null },
    cart: { items: [] },
    lang: { current: "vi" },
    ack: { visible: false, status: null, message: "" },
    orders: { active: [], inactive: [], isBarExpanded: false },
    order: { action: null, line: null, status: "idle", at: null },
    delivery: { state: "idle", retries: 0 }
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
  setupEventListeners();
  bootstrapOrderTracker();
  subscribe(syncUI);
  syncUI(getState());
}

async function syncUI(state) {
  const prevState = getPrevState();

  const overlayChanged =
    state.overlay.view !== prevState.overlay?.view ||
    state.overlay.value !== prevState.overlay?.value;

  const contextChanged = !isEqual(state.context, prevState.context);

  const panelChanged =
    state.panel.view !== prevState.panel?.view ||
    state.panel.option !== prevState.panel?.option;

  const cartChanged = !isEqual(
    state.cart.items || [],
    prevState.cart.items || []
  );

  const langChanged = state.lang?.current !== prevState.lang?.current;

  const ackChanged =
    state.ack.visible !== prevState.ack?.visible ||
    state.ack.message !== prevState.ack?.message ||
    state.ack.status !== prevState.ack?.status;

  const ordersChanged = !isEqual(
    state.orders.active || [],
    prevState.orders?.active || []
  );

  const inactiveChanged = !isEqual(
    state.orders.inactive || [],
    prevState.orders?.inactive || []
  );

  const statusBarExpandedChanged =
    state.orders?.isBarExpanded !== prevState.orders?.isBarExpanded;

  syncOverlayIfNeeded(state, overlayChanged);
  syncContextIfNeeded(state, contextChanged);
  syncPanelIfNeeded(state, panelChanged);
  syncCartIfNeeded(state, cartChanged);
  syncLanguageIfNeeded(state, langChanged);
  syncAckIfNeeded(state, ackChanged);
  syncStatusBarIfNeeded(
    state,
    ordersChanged,
    inactiveChanged,
    statusBarExpandedChanged,
    overlayChanged
  );

  await handleOrderLogic(state);
  //await resumePendingOrderAfterPlace(state, prevState);
  syncOrderFeedback(state, prevState);

  lastState = JSON.parse(JSON.stringify(getState()));
}

function syncOverlayIfNeeded(state, overlayChanged) {
  if (!overlayChanged) return;

  switch (state.overlay.view) {
    case "cartDrawer":
      renderDrawer(state);
      break;
    case "placePicker":
      renderPlacePicker(state);
      break;
    case "orderTrackerPage":
      openOrderTracker();
      break;
    case "itemDetail":
      renderItemDetail(state);
      break;
    default:
      break;
  }

  syncOverlay(state.overlay.view || null);
}

function syncContextIfNeeded(state, contextChanged) {
  if (!contextChanged) return;

  renderNavBar(state);
  renderDrawer(state);
}

function syncPanelIfNeeded(state, panelChanged) {
  if (!panelChanged) return;

  eventHub(state);
  showPanel(state);
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
  eventPanelLang(state);

  if (state.overlay.view === "cartDrawer") {
    renderDrawer(state);
  } else if (state.overlay.view === "placePicker") {
    renderPlacePicker(state);
  } else if (state.overlay.view === "orderTrackerPage") {
    openOrderTracker();
  } else if (state.overlay.view === "itemDetail") {
    renderItemDetail(state);
  }
}

function syncAckIfNeeded(state, ackChanged) {
  if (!ackChanged) return;
  renderAck(state);
}

function syncStatusBarIfNeeded(
  state,
  ordersChanged,
  inactiveChanged,
  statusBarExpandedChanged,
  overlayChanged
) {
  const trackerOpen = state.overlay.view === "orderTrackerPage";

  const shouldRenderStatusBar =
    ordersChanged ||
    inactiveChanged ||
    statusBarExpandedChanged ||
    (trackerOpen && overlayChanged);

  if (!shouldRenderStatusBar) return;

  startOrderPolling();
  renderStatusBar(state);

  if (trackerOpen || ordersChanged || inactiveChanged) {
    openOrderTracker();
  }
}

async function handleOrderLogic(state) {
  const { action, at } = state.order || {};
  const isNewCommand = !!action && !!at && at !== lastHandledOrderAt;

  if (!isNewCommand) return;
  if (isProcessingOrder) return;
  if (getState().delivery?.state === "sending") return;

  lastHandledOrderAt = at;
  isProcessingOrder = true;

  try {
    switch (action) {
      case "add_cart":
        addToCart();
        break;

      case "buy_now":
      case "send_cart":
        await processOrder(state, action);
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
    state.order.status !== prevState.order?.status ||
    state.order.action !== prevState.order?.action ||
    state.order.line !== prevState.order?.line ||
    state.order.at !== prevState.order?.at;

  if (!orderChanged) return;
  switchToast(state.order.status);
}

async function resumePendingOrderAfterPlace(state, prevState) {
  const waitingBefore = prevState.order?.status === "waiting_place";
  const sameAction =
    state.order.action === "buy_now" ||
    state.order.action === "send_cart";

  const hasPlaceNow = !!getLocationInfo().placeId;

  const overlayClosed =
    prevState.overlay?.view === "placePicker" &&
    state.overlay.view !== "placePicker";

  if (!waitingBefore) return;
  if (!sameAction) return;
  if (!hasPlaceNow) return;
  if (!overlayClosed) return;
  if (isProcessingOrder) return;
  if (getState().delivery?.state === "sending") return;

  isProcessingOrder = true;

  try {
    await processOrder(state, state.order.action);
  } finally {
    isProcessingOrder = false;
  }
}