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

  // CHẶN VÒNG LẶP: Cập nhật trí nhớ trước khi thực hiện các hành động gây ra setState
  lastState = JSON.parse(JSON.stringify(state));

  const isViewChanged = state.overlay?.view !== prevState.overlay?.view;
  const isCartChanged = JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items);
  const isLangChanged = state.lang?.current !== prevState.lang?.current;

  // 1. ĐỒNG BỘ LOCALSTORAGE
  syncStorage(state, prevState);

  // 2. RENDER OVERLAYS (Cùng cấp trong khối isViewChanged)
  if (isViewChanged || (state.overlay?.view && isCartChanged) || isLangChanged) {
    if (isViewChanged) syncOverlay(state.overlay?.view);
    
    // Gọi đúng hàm render dựa trên view hiện tại
    const view = state.overlay?.view;
    if (view === "cartDrawer") renderDrawer(state);
    if (view === "placePicker") renderPlacePicker(state);
    if (view === "itemDetail") renderItemDetail(state);
    if (view === "orderTrackerPage") openOrderTracker(state); // <--- Đã nằm trong khối check view
  }

  // 3. RENDER CÁC THÀNH PHẦN NGOÀI (Luôn cập nhật khi cart/lang đổi)
  if (isCartChanged || isLangChanged || isViewChanged) {
    renderCartBar(state);
    renderStatusBar(state);
    renderNavBar(state);
    renderHub(state);
    eventHub(state);
  }

  if (state.panel?.view !== prevState.panel?.view) {
    renderPanel(state);
  }

  // 4. SIDE EFFECTS (Gửi đơn & Thông báo)
  processOrders(state);
  if (state.order?.status !== prevState.order?.status) {
    syncOrderFeedback(state.order?.status);
  }
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