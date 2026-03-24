// ui/sync.js

import { subscribe, getState } from "../../core/state.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { openPicker } from "../render/renderPlacePicker.js";
import { openCartDrawer } from "../render/renderDrawer.js";
import { closeOverlay } from "../interactions/backdropManager.js";
import { renderDrawer } from "../render/renderDrawer.js";


let lastState = {};

/* =========================
   MAIN SYNC
========================= */

export function attachUI() {
  subscribe(syncUI);
  syncUI(getState());
}

function syncUI(state) {

  /* ---------- OVERLAY ---------- */

    if (state.view.overlay !== lastState.view?.overlay) {
        switch (state.view.overlay) {
            case "cartDrawer":
                openCartDrawer();
                break;
          
            case "placePicker":
                openPicker();
                break;
            
            default:
                break;
        }
    } 
    if (state.view.overlay === null) {
        closeOverlay();
    
    }

  /* ---------- NAV ---------- */

  if (state.context !== lastState.context) {
    renderNavBar();
  }

  /* ---------- PANEL ---------- */

  if (state.view.panel !== lastState.view?.panel) {
    renderPanel(state.view.panel);
  }

    /* ---------- CART ---------- */
    if (state.cart.items.length !== lastState.cart?.items?.length) {

        if (state.cart.items.length === 0) {
            document.getElementById("cartBar").classList.add("hidden");
        } else {
            renderCartBar();
            document.getElementById("cartBar").classList.add("hidden");
        }
    
        renderCartBar();
        renderStatusBar();
        renderDrawer();
  }

  /* ---------- LANGUAGE ---------- */

  if (state.lang?.current !== lastState.lang?.current) {
    syncLanguage(state);
  }
    

  lastState = structuredClone(state);
}

/* =========================
   LANGUAGE
========================= */

function syncLanguage(state) {
  

  // re-render toàn bộ UI phụ thuộc ngôn ngữ
  renderNavBar();
  renderCartBar();
  renderStatusBar();
  renderHub();
  renderPanel(state.view.panel);
}
