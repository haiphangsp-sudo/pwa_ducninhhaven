// ui/sync.js
import { subscribe, getState } from "../../core/state.js";
import { CONFIG } from "../../config.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { showToast } from "../render/renderAck.js";
import { setupEventListeners } from "./globalEvents.js";
import { bootstrapOrderTracker } from "./appFlow.js";

// Import 14 hàm Render
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
  setupEventListeners(); // Lắng nghe click
  bootstrapOrderTracker(); // Khởi chạy theo dõi đơn hàng ngầm (appFlow)
  subscribe(syncUI); // Đăng ký đồng bộ State
  syncUI(getState()); // Chạy lần đầu để nạp UI
}

function syncUI(state) {
  const prevState = lastState ? JSON.parse(JSON.stringify(lastState)) : {};

  // 1. LỒNG GHÉP: ĐỒNG BỘ LOCALSTORAGE (Giỏ hàng & Ngôn ngữ)
  persistData(state, prevState);

  // 2. ĐỒNG BỘ OVERLAY & BACKDROP
  if (state.overlay.view !== prevState.overlay?.view || state.overlay.value !== prevState.overlay?.value) {
    syncOverlay(state.overlay.view || null);
    // Render Overlay cụ thể
    if (state.overlay.view === "cartDrawer") renderDrawer(state);
    if (state.overlay.view === "placePicker") renderPlacePicker(state);
    if (state.overlay.view === "itemDetail") renderItemDetail(state); // Nhận ID món từ overlay.value
    if (state.overlay.view === "orderTrackerPage") openOrderTracker(state);
  }

  // 3. RENDER CÁC THÀNH PHẦN CÒN LẠI (Chỉ khi dữ liệu liên quan thay đổi)
  if (state.lang?.current !== prevState.lang?.current) {
    renderNavBar(state); renderCartBar(state); renderStatusBar(state); renderHub(state); renderPanel(state);
  }
  
  // Render bổ trợ
  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  if (state.panel?.view !== prevState.panel?.view) {
    eventHub(state);
    renderPanel(state);
  }

  // 4. XỬ LÝ ĐƠN HÀNG (Side Effects)
  handleOrderSideEffects(state);

  // 5. THÔNG BÁO (Toast Feedback)
  if (state.order?.status !== prevState.order?.status) {
    syncOrderFeedback(state.order?.status);
  }

  lastState = JSON.parse(JSON.stringify(state));
}

function persistData(state, prevState) {
  // Lưu giỏ hàng
  if (JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items)) {
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart?.items || []));
  }
  // Lưu ngôn ngữ
  if (state.lang?.current !== prevState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
  }
}

async function handleOrderSideEffects(state) {
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
    duplicate: { type: "info", msg: "cart_bar.duplicate" },
    added: { type: "success", msg: "cart_bar.added" }
  }[status];
  if (config) showToast({ type: config.type, message: config.msg, duration: 2500 });
}