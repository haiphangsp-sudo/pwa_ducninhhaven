// ui/sync.js

import { subscribe, getState, setState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js"
import { addToCart, buyNow, sendCart } from "../../core/events.js";
import { applyPlaceById } from "../../core/context.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";

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


async function syncOrderFlow(state) {
  const { type, line } = state.order || {};
  
  // 1. Kiểm tra lồng nhau:
  // Nếu đang xử lý một hành động UI HOẶC Queue đang bận gửi đơn ngầm -> Thoát sớm
  if (!type || isProcessingOrder) return;

  // 2. Kiểm tra điều kiện vị trí cho các đơn hàng cần xác thực bàn/phòng
  if ((type === "instant" || type === "send_cart") && !state.context.active?.id) {
    if (state.overlay.view !== "placePicker") {
      setState({ overlay: { view: "placePicker" } });
    }
    return;
  }

  // Khóa luồng UI
  isProcessingOrder = true;

  try {
    // Chỉ hiển thị "Sending..." nếu đây không phải tác vụ thêm vào giỏ hàng (vì nó tức thì)
    if (type !== "cart") {
      setState({ ack: { state: "show", status: "sending" } });
    }

    switch (type) {
      case "cart":
        if (line) addToCart(line);
        break;
      case "instant":
        if (line) await buyNow(line); // Hàm này giờ gọi finalizeOrderSuccess('instant')
        break;
      case "send_cart":
        await sendCart(); // Hàm này gọi finalizeOrderSuccess('cart')
        break;
    }
  } catch (error) {
    console.error("Lỗi OrderFlow:", error);
    setState({ ack: { state: "show", status: "error" } });
  } finally {
    // Luôn giải phóng khóa và reset order state
    setState({ order: { type: null, line: null } });
    isProcessingOrder = false;
  }
}