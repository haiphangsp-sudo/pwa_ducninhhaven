// ui/sync.js

import { subscribe, getState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js"
import { addToCart, submitOrder } from "../../core/events.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub, eventHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { syncStepperStates } from "../render/renderStepper.js";
import { renderAck } from "../render/renderAck.js";
import { openOrderTracker } from "../components/orderTracker.js";

let lastState = null; 
let isProcessingOrder = false;

/* =======================================================
   ENTRY
======================================================= */

export function attachUI() {
  subscribe(syncUI);
  syncUI(getState());
}

/* =======================================================
   MAIN SYNC
======================================================= */

async function syncUI(state) {


  // Deep copy để so sánh
  const prevState = lastState
    ? JSON.parse(JSON.stringify(lastState))
    : { orders: {}, cart: { items: [] } };
  
  

  /* ---------- OVERLAY ---------- */
  const activeId = state.overlay.view;
  if (activeId !== prevState.overlay?.view) {
        
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

  /* ---------- CONTEXT ---------- */
  
  if (state.context !== prevState.context) {
    renderNavBar(state);
    renderDrawer(state);
  }

  /* ---------- PANEL ---------- */

  if (state.panel.view !== prevState.panel?.view) {
    renderPanel(state);
    eventHub(state);
  }
  
  /* ---------- CART ---------- */

  if (state.cart !== lastState?.cart ) {
    renderCartBar(state);
    renderDrawer(state);
    
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart.items || []));
  }


  /* ---------- LANGUAGE ---------- */

  if (state.lang.current !== prevState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
    syncLanguage(state);
  }

  if (state.ack.visible !== prevState.ack?.visible) {
    renderAck(state);
  }
  if (state.orders.isBarExpanded !== prevState.orders?.isBarExpanded || state.orders.active !== prevState.orders?.active) {
    renderStatusBar(state);
  }

  handleOrderLogic(state, prevState);

  lastState = JSON.parse(JSON.stringify(state));
  
  
}

function syncLanguage(state) {

  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
}


/* --- 1. Xử lý luồng Đặt hàng --- */
async function handleOrderLogic(state, prevState) {
  const { action, at } = state.order || {};
  if (!action || !at || at === prevState.order?.at || isProcessingOrder) return;

  isProcessingOrder = true;
  try {
    switch (action) {
      //bounceCartBar();

      case "add_cart":
        addToCart();
        break;
      
      case "buy_now":
          await submitOrder(action);
        break;
      
      case "send_cart":
          await submitOrder(action);
        break;
      
      default:
        break;
    }

  } finally {
    isProcessingOrder = false;
    syncStepperStates(state, prevState);

  }
}