// ui/sync.js
import { subscribe, getState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { showToast } from "../render/renderAck.js";
import { setupEventListeners } from "./globalEvents.js";
import { bootstrapOrderTracker } from "./appFlow.js";

import { renderNavBar } from "../render/renderNavBar.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub, eventHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderItemDetail } from "../render/renderItemDetail.js";
import { openOrderTracker } from "../components/orderTracker.js";

let lastState = null;
let isProcessingOrder = false;
let lastHandledOrderAt = null;

export function attachUI() {
  setupEventListeners();
  bootstrapOrderTracker(); 
  subscribe(syncUI);
  syncUI(getState()); 
}
function syncUI(state) {
  if (!state) return;
  const prevState = lastState || {};

  // --- CÁC BIẾN KIỂM TRA THAY ĐỔI ---
  const isViewChanged = state.overlay?.view !== prevState.overlay?.view;
  const isCartChanged = JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items);
  
  const isLangChanged = state.lang?.current !== prevState.lang?.current;
  const isPlaceChanged = state.context?.current?.id !== prevState.context?.current?.id;
  const isPanelViewChanged = state.panel?.view !== prevState.panel?.view;
  const isOrdersChanged = JSON.stringify(state.orders) !== JSON.stringify(prevState.orders);
  // 1. QUẢN LÝ HUB & PANEL (Vùng nội dung chính)
  
  // Xử lý Hub (Các nút bấm bên dưới)
  if (isLangChanged || isPlaceChanged) {
    renderHub(state); // Chỉ vẽ lại icon khi đổi ngôn ngữ/vị trí (nháy icon là cần thiết)
  } else if (isPanelViewChanged) {
    eventHub(state);  // Chỉ đổi class is-active (không nháy icon)
  }

  // Xử lý Panel (Nội dung món ăn/bài viết bên trên)
  // Phải render lại khi: Đổi trang, Đổi ngôn ngữ, hoặc Đổi vị trí
  if (isPanelViewChanged || isLangChanged || isPlaceChanged) {
    renderPanel(state);
  }

  // 2. QUẢN LÝ OVERLAY (Cơ chế lồng thẻ trong #overlay)
  if (isViewChanged || isCartChanged || isLangChanged) {
    const view = state.overlay?.view;
    if (view === "cartDrawer") renderDrawer(state);
    if (view === "placePicker") renderPlacePicker(state);
    if (view === "itemDetail") renderItemDetail(state); // Nhận ID từ state.overlay.value
    if (view === "orderTrackerPage") openOrderTracker();
    syncOverlay(state.overlay?.view);
  
    if (isOrdersChanged) {
      renderStatusBar(state);
      openOrderTracker();
    }
  }
  // 3. CÁC THÀNH PHẦN LUÔN HIỆN HỮU
  if (isCartChanged || isLangChanged || isViewChanged) {
    renderNavBar(state);
    renderCartBar(state);
    renderStatusBar(state);
  }

  // 4. SIDE EFFECTS (Lưu trữ & Đơn hàng)
  syncStorage(state, prevState);
  processOrders(state);
  if (state.order?.status !== prevState.order?.status) {
    syncOrderFeedback(state.order?.status);
  }
  lastState = JSON.parse(JSON.stringify(state));
}

function syncStorage(state, prevState) {
  if (JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items)) {
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart?.items || []));
  }
  if (state.lang?.current !== prevState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang?.current);
  }
}

async function processOrders(state) {
  const { action, at } = state.order || {};
  if (!action || at === lastHandledOrderAt || isProcessingOrder) return;
  lastHandledOrderAt = at;
  isProcessingOrder = true;
  try {
    if (action === "add_cart") addToCart();
    if (["send_cart", "buy_now"].includes(action)) await submitOrder(action);
  } finally {
    isProcessingOrder = false;
  }
}

function syncOrderFeedback(status) {
  if (!status || ["idle", "sending"].includes(status)) return;
  const config = {
    success: { type: "success", msg: "cart_bar.success" },
    error: { type: "error", msg: "cart_bar.error" },
    duplicate: { type: "info", msg: "cart_bar.duplicate" }
  }[status];
  if (config) showToast({ type: config.type, message: config.msg });
}