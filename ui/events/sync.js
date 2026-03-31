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


   // Deep copy để so sánh
  const prevState = lastState ? JSON.parse(JSON.stringify(lastState)) : { order: {}, cart: { items: [] } };
  lastState = JSON.parse(JSON.stringify(state));

  handleOrderLogic(state, prevState);
  syncStepperStates(state, prevState);
  

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
  const { action, at } = state.order || {};
  const prevAt = prevState.order?.at;

  // Nếu không có hành động hoặc người dùng chưa bấm (at không đổi) -> Thoát im lặng
  if (!action || !at || at === prevAt) return;

  // Nếu đang xử lý đơn cũ mà khách bấm tiếp -> Chặn lại
  if (isProcessingOrder) {
    console.warn("⏳ Hệ thống đang bận xử lý đơn trước...");
    return;
  }

  isProcessingOrder = true; // ĐÓNG KHÓA

  try {
    console.log(`🚀 [Haven Sync] Bắt đầu xử lý: ${action} (at: ${at})`);

    if (action === "add-cart") {
      addToCart(); 
    } else {
      // Gọi submitOrder (Hàm này sẽ gọi buildPayload bên trong)
      const success = await submitOrder(action);
      console.log(`🏁 Kết quả xử lý ${action}:`, success ? "Thành công" : "Thất bại");
    }
  } catch (err) {
    console.error("🔥 Lỗi nghiêm trọng trong luồng Sync:", err);
  } finally {
    // QUAN TRỌNG NHẤT: Luôn mở khóa dù thành công hay lỗi
    isProcessingOrder = false; 
    console.log("🔓 Đã mở khóa luồng cho lệnh tiếp theo");
  }
}
// ui/sync.js

/* --- 1. Xử lý luồng Đặt hàng --- */
async function handleOrderLogic(state, prevState) {
  const { action, at } = state.order || {};
  if (!action || !at || at === prevState.order?.at || isProcessingOrder) return;

  isProcessingOrder = true;
  try {
    if (action === "add-cart") {
      addToCart(); 
    } else {
      await submitOrder(action);
    }
  } finally {
    isProcessingOrder = false;
  }
}

/* --- 2. Xử lý đồng bộ nút Stepper (Cộng/Trừ) --- */
function syncStepperStates(state, prevState) {
  const currentItems = state.cart?.items || [];
  const prevItems = prevState.cart?.items || [];

  // Cập nhật các món mới hoặc thay đổi số lượng
  currentItems.forEach(item => {
    const prev = prevItems.find(i => i.id === item.id);
    if (!prev || prev.qty !== item.qty) {
      updateStepperUI(item.id, item.qty);
    }
  });

  // Reset các món vừa bị xóa khỏi giỏ
  prevItems.forEach(prevItem => {
    const stillInCart = currentItems.find(i => i.id === prevItem.id);
    if (!stillInCart) updateStepperUI(prevItem.id, 0);
  });
}
