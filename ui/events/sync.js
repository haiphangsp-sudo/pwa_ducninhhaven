// ui/sync.js

import { subscribe, getState, setState } from "../../core/state.js";
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
import { applyPlaceById } from "../../core/context.js";
import { syncContextToState } from "../../core/state.js"


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

  /* ---------- OVERLAY ---------- */
    const activeId = state.overlay.view;
    if (activeId !== lastState.overlay?.view) {
        
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
  if (state.place.selected !== lastState.place?.selected) {
    const ok = applyPlaceById(state.place.selected);
    if (!ok) return;
    syncContextToState();
  }
  if (state.context !== lastState.context) {
    renderNavBar(state);
    renderDrawer(state);
  }

  /* ---------- PANEL ---------- */

  if (state.panel.view !== lastState.panel?.view) {
    renderPanel(state);
    renderHub(state);
  }

  /* ---------- CART ---------- */

  if (state.cart.items !== lastState.cart?.items) {
    renderCartBar(state);
    renderStatusBar(state);
    renderDrawer(state);

    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart.items || []));
  }

  /* ---------- LANGUAGE ---------- */

  if (state.lang.current !== lastState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
    syncLanguage(state);
  }

  /* ---------- ORDER FLOW ---------- */

  if (
    state.order !== lastState.order ||
    state.context.active !== lastState.context?.active
  ) {
    await syncOrderFlow(state);
  }

  lastState = structuredClone(state);
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

/* =======================================================
   ORDER ORCHESTRATION
======================================================= */

// ui/sync.js
async function syncOrderFlow(state) {
  const { type, line } = state.order || {};
  const activePlace = state.context.active;

  if (!type || isProcessingOrder) return;

  // 1. Kiểm tra vị trí (Chỉ đơn gửi đi mới cần)
  if (type === "instant" || type === "send_cart") {
    if (!activePlace?.id) {
      if (state.overlay.view !== "placePicker") {
        setState({ overlay: { view: "placePicker" } });
      }
      return; 
    }
  }

  // 2. Thực thi Action
  isProcessingOrder = true;
  
  // Hiện loading nếu cần gửi qua API
  if (type !== "cart") {
    setState({ ack: { state: "show", status: "sending" } });
  }

  try {
    switch (type) {
      case "cart":
        if (line) addToCart(line);
        break;
      case "instant":
        if (line) await buyNow(line); // Hàm này gọi finalizeOrderSuccess('instant')
        break;
      case "send_cart":
        await sendCart(); // Hàm này gọi finalizeOrderSuccess('cart')
        break;
    }
  } catch (error) {
    setState({ ack: { state: "show", status: "error" } });
  } finally {
    // 3. Giải phóng State
    setState({ order: { type: null, line: null } });
    isProcessingOrder = false;
  }
}
