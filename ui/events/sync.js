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
                openCartDrawer(state);
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
        renderNavBar(state);
    }

    /* ---------- PANEL ---------- */

    if (state.view.panel !== lastState.view?.panel) {
        renderPanel(state);
        renderHub(state);
        const panelEl = document.querySelector(".category-panel");
        if (panelEl && state.view.panel !== null) {
            // Đợi một chút để trình duyệt render xong DOM rồi mới cuộn
            setTimeout(() => {
                panelEl.scrollIntoView({ 
                behavior: "smooth", // Cuộn mượt mà
                block: "start"      // Đưa mép trên của panel lên đầu màn hình
                });
            }, 100); 
        }
    }

    /* ---------- CART ---------- */
    if (state.cart.items !== lastState.cart?.items) {
    
        renderCartBar(state);
        renderStatusBar(state);
        renderDrawer(state);
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
  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);
}
