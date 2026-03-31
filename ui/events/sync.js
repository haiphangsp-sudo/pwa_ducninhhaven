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
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { updateStepperUI } from "../render/renderStepper.js";
import { renderAck } from "../render/renderAck.js";


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

  const prevState = lastState ? JSON.parse(JSON.stringify(lastState)) : { order: {}, cart: { items: [] } };
  lastState = JSON.parse(JSON.stringify(state));

  syncOrderFlow(state,prevState);

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
    renderHub(state);
    renderPanel(state);
  }
  /* ---------- ACK ---------- */

  if (state.ack !== prevState.ack) {
    renderAck(state);
  }
  /* ---------- CART ---------- */

  if (state.cart.items !== prevState.cart?.items) {
    renderCartBar(state);
    renderDrawer(state);

    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart.items || []));
    /* ---------- STEPPER SYNC ---------- */
    // So sánh từng món trong giỏ hàng để cập nhật số lượng
    state.cart.items.forEach(item => {
      const prevItem = prevState.cart?.items.find(i => i.id === item.id);
      if (!prevItem || prevItem.qty !== item.qty) {
        updateStepperUI(item.id, item.qty);
      }
    });
  }

  /* ---------- LANGUAGE ---------- */

  if (state.lang.current !== prevState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
    syncLanguage(state);
  }

  const currentItems = state.cart?.items || [];
  const prevItems = prevState.cart?.items || [];
  // Cập nhật hoặc thêm mới món vào UI
  currentItems.forEach(item => {
    if (!item?.id) return; // Bảo vệ khỏi undefined
    const pItem = prevItems.find(i => i?.id === item.id);
    if (!pItem || pItem.qty !== item.qty) {
      updateStepperUI(item.id, item.qty);
    }
  });

  // Xử lý món bị xóa khỏi giỏ
  prevItems.forEach(pItem => {
    if (!pItem?.id) return;
    const exists = currentItems.find(i => i?.id === pItem.id);
    if (!exists) updateStepperUI(pItem.id, 0);
  });
  
  lastState = state;
}

/* =======================================================
   LANGUAGE
======================================================= */

function syncLanguage(state) {

  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);
  renderDrawer(state);
}

async function syncOrderFlow(state, prevState) {
  const { action, line, at } = state.order || {};
  const prevAt = prevState.order?.at;

  // GỐC RỄ 3: So sánh at trên hai vùng nhớ độc lập
  if (!action || !at || at === prevAt || isProcessingOrder) return;

  isProcessingOrder = true;

  try {
    if (action === "add-cart") {
      addToCart(); 
    } else if (action === "buy-now") {
      await submitOrder("instant");
    } else if (action === "send-cart") {
      await submitOrder("send-cart");
    }
  } catch (err) {
    console.error("Sync Flow Error:", err);
  } finally {
    isProcessingOrder = false; 
  }
}