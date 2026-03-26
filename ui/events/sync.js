// ui/sync.js
import { renderAckOverlay } from "../render/renderOverlay.js";
import { subscribe, getState } from "../../core/state.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar, loadingCartBar, bounceCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { closeOverlay, showOverlay } from "../interactions/backdropManager.js";
import { CONFIG } from "../../config.js";
import { addToCart, sendCart, sendInstant } from "../../core/events.js";


let lastState = {};

/* =========================
   MAIN SYNC
========================= */

export function attachUI() {
  subscribe(syncUI);
  syncUI(getState());
}

async function syncUI(state) {

  /* ---------- OVERLAY ---------- */

    if (state.overlay !== lastState.overlay) {
        switch (state.overlay) {

            case "cartDrawer":
                renderDrawer(state);
                break;
          
            case "placePicker":
                renderPlacePicker();
                break;
            
            default:
                break;
        }
        showOverlay(state.overlay);
    } 

    if (state.overlay === null && lastState.overlay !== null) {
        closeOverlay();
    }

    /* ---------- NAV ---------- */

    if (state.context !== lastState.context) {
        renderNavBar(state);
    }

    /* ---------- PANEL ---------- */

    if (state.panel && state.panel !== lastState.panel) {
        
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
    if (state.order !== lastState.order) {

        switch (state.order.type) {

            case "cart": 
                bounceCartBar();
                addToCart(state.order.line);
                break;
            
            case "instant":
                bounceCartBar();
                await sendInstant(state.order.line);
                break;
            
            case "send_cart":
                loadingCartBar();
                await sendCart();
            break;
        }
    } 
        
    if (state.ack !== lastState.ack) {
        renderAckOverlay(state.ack);
    }

  /* ---------- LANGUAGE ---------- */

    if (state.lang?.current !== lastState.lang?.current) {
        localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
        syncLanguage(state);
    }
    if(state.meta?.version !== lastState.meta?.version){
        //checkVersion(state);
    }
    if (state.context?.active?.id !== lastState.context?.active?.id) {
        applyPlaceById(state.context?.active?.id);
        closeOverlay();
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


