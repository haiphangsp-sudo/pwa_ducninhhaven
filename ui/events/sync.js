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

// ui/sync.js

async function syncOrderFlow(state) {
  // 1. Giải nén dữ liệu để code gọn hơn
  const { type, line } = state.order || {};
  const activePlace = state.context.active;

  // 2. Guard Clauses: Thoát sớm nếu không có hành động hoặc đang bận xử lý
  if (!type || isProcessingOrder) return;

  // 3. Kiểm tra điều kiện tiên quyết (Place Check)
  // Mua ngay và Gửi giỏ bắt buộc phải có thông tin phòng/bàn tại resort
  if (type === "instant" || type === "send_cart") {
    if (!activePlace?.id) {
      // Nếu chưa có chỗ, mở bảng chọn vị trí và dừng luồng xử lý
      if (state.overlay.view !== "placePicker") {
        setState({ overlay: { view: "placePicker" } });
      }
      return; 
    }
  }

  // 4. Bắt đầu xử lý: Khóa luồng để tránh gửi đơn trùng lặp
  isProcessingOrder = true;

  try {
    switch (type) {
      case "cart":
        // Thêm vào giỏ là thao tác đồng bộ, xử lý nhanh
        if (line) addToCart(line);
        break;

      case "instant":
        // Mua ngay cần đợi API phản hồi
        if (line) await buyNow(line); 
        break;

      case "send_cart":
        // Gửi toàn bộ giỏ hàng
        await sendCart();
        break;
    }
  } catch (error) {
    console.error("Lỗi thực thi đơn hàng:", error);
  } finally {
    // 5. Centralized Reset: Luôn dọn dẹp trạng thái dù thành công hay thất bại
    // Việc reset 'order' giúp syncUI không bị lặp lại logic này ở lần render kế tiếp
    setState({ 
      order: { type: null, line: null } 
    });
    
    isProcessingOrder = false;
  }
}