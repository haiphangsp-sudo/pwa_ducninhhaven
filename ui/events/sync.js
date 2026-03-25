// ui/sync.js
import { renderAckOverlay } from "../render/renderOverlay.js";
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
import { CONFIG } from "../../config.js";



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
    if (state.view.overlay === null && lastState.view?.overlay !== null) {
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
        
    }

    /* ---------- CART ---------- */
    if (state.cart.items !== lastState.cart?.items) {
    
        renderCartBar(state);
        renderStatusBar(state);
        renderDrawer(state);
        localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart.items));
        
        // để báo hiệu cho khách là giỏ hàng đã cập nhật
        document.getElementById("cartBar")?.classList.add("cart-bounce");
        setTimeout(() => {
            document.getElementById("cartBar")?.classList.remove("cart-bounce");
        }, 400);
    }
    if (state.ack !== lastState.ack) {
        renderAckOverlay(state.ack);
    }

  /* ---------- LANGUAGE ---------- */

    if (state.lang?.current !== lastState.lang?.current) {
        localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
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
