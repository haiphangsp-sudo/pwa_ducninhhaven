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
import { updateStepperUI } from "../render/renderStepper.js";


let lastState = {};

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
  if (state.place.selected !== prevState.place?.selected) {
    applyPlaceById(state.place.selected);
  }
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
  }


  const { order, context } = state;
  const isNewOrder = order.at !== prevState.order?.at;
  const isStatusChange = order.status !== prevState.order?.status;

  /* ---------- 1. LOGIC TỰ PHỤC HỒI (AUTO-RESUME) ---------- */
  // Nếu lệnh đang chờ vị trí, mà nay context đã có vị trí -> Tự động kích hoạt
  if (order.status === "place-selected" && context.active?.id) {
    setState({ 
      order: { status: "pending", at: isNewOrder } 
    });
    return;
  }

  /* ---------- 2. THỰC THI LỆNH (EXECUTION) ---------- */
  // Chỉ thực thi khi trạng thái là 'pending'
  if (order.status === "pending") {
    
    // Chuyển sang 'sending' để StatusBar hiện loading ngay lập tức
    setState({ order: { status: "sending", msg: "Đang xử lý..." } });

    try {
      switch (order.type) {
        case "cart":
          addToCart(order.line);
          setState({ order: { status: "success", msg: "Đã thêm vào giỏ" } });
          break;
        case "instant":
          await buyNow(order.line);
          setState({ order: { status: "success", msg: "Gửi yêu cầu thành công!" } });
          break;
        case "send_cart":
          await sendCart();
          setState({ order: { status: "success", msg: "Đơn hàng đã được gửi!" } });
          break;
      }
    } catch (err) {
      setState({ order: { status: "error", msg: err.message || "Có lỗi xảy ra" } });
    }
  }

  /* ---------- 3. PHẢN HỒI GIAO DIỆN (RENDERING) ---------- */
  if (isStatusChange) {
    renderStatusBar(state);
    
    // Tự động dọn dẹp thông báo thành công
    if (order.status === "success") {
      setTimeout(() => {
        // Trở về idle và xóa type để sẵn sàng cho lệnh tiếp theo
        setState({ order: { status: "idle", type: null, msg: "" } });
      }, 3000);
    }
  }

  /* ---------- RENDER DỰA TRÊN TRẠNG THÁI GIỎ ---------- */
  if (state.cart.status !== prevState.cart?.status) {
    renderStatusBar(state);
    if (state.cart.status === 'success') {
      // Wellness effect: Tự đóng drawer sau khi thành công
      //renderStatusBar(state);
      setTimeout(() => setState({ overlay: { view: null }, cart: { ...state.cart, status: 'idle' } }), 2500);
    }
  }
  /* ---------- LANGUAGE ---------- */

  if (state.lang.current !== prevState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
    syncLanguage(state);
  }

  /* ---------- STEPPER SYNC ---------- */
  // So sánh từng món trong giỏ hàng để cập nhật số lượng
  state.cart.items.forEach(item => {
    const prevItem = prevState.cart?.items.find(i => i.id === item.id);
    if (!prevItem || prevItem.qty !== item.qty) {
      updateStepperUI(item.id, item.qty);
    }
  });
  
  // Xử lý trường hợp món bị xóa hoàn toàn khỏi giỏ
  prevState.cart?.items.forEach(prevItem => {
    const stillExists = state.cart.items.find(i => i.id === prevItem.id);
    if (!stillExists) updateStepperUI(prevItem.id, 0);
  });
  

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

async function syncOrderFlow(state) {
    const { type, line, at, status } = state.order;
    
    // Chỉ chạy nếu có click mới (at thay đổi) và chưa ở trạng thái đang xử lý
    if (!at || at === lastState.order?.at || isProcessingOrder) return;

    // KIỂM TRA VỊ TRÍ (Place Check)
    if ((type === "instant" || type === "send_cart") && !state.context.active?.id) {
        setState({ 
            order: { ...state.order, status: "waiting_place", msg: translate("place.required") },
            overlay: { view: "placePicker" } 
        });
        return;
    }

    isProcessingOrder = true;

    try {
        if (type === "cart") {
            addToCart(line);
        } else {
            // Cập nhật trạng thái 'sending' để renderStatusBar hiện spinner
            setState({ order: { ...state.order, status: "sending", msg: translate("order.sending") } });
            
            if (type === "instant") await buyNow(line);
            if (type === "send_cart") await sendCart();
        }
    } catch (error) {
        setState({ order: { ...state.order, status: "error", msg: translate("order.fail") } });
    } finally {
        isProcessingOrder = false;
    }
}