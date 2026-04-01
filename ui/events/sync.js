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
import { updateStepperUI } from "../render/renderStepper.js";
import { renderAck } from "../render/renderOverlay.js";
import { bounceCartBar } from "../render/renderCartBar.js";


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
    : { order: {}, cart: { items: [] } };
  
  lastState = JSON.parse(JSON.stringify(state));
  

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

  if (state.cart.items !== prevState.cart?.items) {
    renderCartBar(state);
    renderDrawer(state);
    renderStatusBar(state);
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

  handleOrderLogic(state, prevState);
  syncStepperStates(state, prevState);

}

function syncLanguage(state) {

  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);
  renderDrawer(state);
}

/* --- 1. Xử lý luồng Đặt hàng --- */
async function handleOrderLogic(state, prevState) {
  const { action, at } = state.order || {};
  if (!action || !at || at === prevState.order?.at || isProcessingOrder) return;

  isProcessingOrder = true;
  try {
    if (action === "add_cart") {
      bounceCartBar();
      addToCart(); 
    } else {
      await submitOrder(action);
    }
  } finally {
    isProcessingOrder = false;
  }
}

/* --- 2. Xử lý đồng bộ nút Stepper (Cộng/Trừ) --- */
function syncStepperStates(state, prevState) {
  const currentItems = state.cart?.items || [];
  const prevItems = prevState.cart?.items || [];

  // Cập nhật các món mới hoặc thay đổi số lượng
  currentItems.forEach(item => {
    const prev = prevItems.find(i => i.id === item.id);
    if (!prev || prev.qty !== item.qty) {
      updateStepperUI(item.id, item.qty);
    }
  });

  // Reset các món vừa bị xóa khỏi giỏ
  prevItems.forEach(prevItem => {
    const stillInCart = currentItems.find(i => i.id === prevItem.id);
    if (!stillInCart) updateStepperUI(prevItem.id, 0);
  });
}
