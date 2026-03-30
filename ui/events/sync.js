// ui/sync.js

import { subscribe, getState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js"
import { addToCart, buyNow, sendCart } from "../../core/events.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { updateStepperUI } from "../render/renderStepper.js";


let lastState = {};
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

  const prevState = lastState;
  lastState = { ...state };

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

  
  
  // Xử lý trường hợp món bị xóa hoàn toàn khỏi giỏ
  prevState.cart?.items.forEach(prevItem => {
    const stillExists = state.cart.items.find(i => i.id === prevItem.id);
    if (!stillExists) updateStepperUI(prevItem.id, 0);
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

async function syncOrderFlow(state,prevState) {
    const { type, line, at, status } = state.order;
    // Chỉ chạy nếu có click mới (at thay đổi) và chưa ở trạng thái đang xử lý
    if (!at || at === prevState.order?.at || isProcessingOrder) return;

    isProcessingOrder = true;

    try {
        if (type === "add-cart") {
            addToCart(line);
        } else {
            
            if (type === "send-instant") await buyNow(line);
            if (type === "send_cart") await sendCart();
        }
    } catch (error) {

    } finally {
        isProcessingOrder = false;
    }
}