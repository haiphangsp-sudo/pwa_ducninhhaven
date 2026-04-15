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

  // 1. CHỐT CHẶN VÒNG LẶP & TRÍ NHỚ
  lastState = JSON.parse(JSON.stringify(state));

  // Các biến cờ (Flags) để kiểm tra thay đổi
  const isViewChanged = state.overlay?.view !== prevState.overlay?.view;
  const isCartChanged = JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items);
  const isLangChanged = state.lang?.current !== prevState.lang?.current;
  const isPanelViewChanged = state.panel?.view !== prevState.panel?.view;
  const isPlaceChanged = state.context?.current?.id !== prevState.context?.current?.id;

  // 2. ĐỒNG BỘ LOCALSTORAGE (Side Effect)
  syncStorage(state, prevState);

  // 3. XỬ LÝ HUB (TRÁNH NHÁY ICON)
  if (isLangChanged || isPlaceChanged) {
    // Chỉ vẽ lại toàn bộ HTML khi đổi ngôn ngữ hoặc đổi vị trí
    renderHub(state);
  } else if (isPanelViewChanged) {
    // Chỉ cập nhật class 'is-active' bằng JS thuần để mượt mà
    eventHub(state);
  }

  // 4. ĐỒNG BỘ OVERLAY (Cơ chế lồng thẻ #overlay của bạn)
  if (isViewChanged || isCartChanged || isLangChanged) {
    // BackdropManager lo việc ẩn/hiện class 'hidden' cho các con của #overlay
    syncOverlay(state.overlay?.view);

    const currentView = state.overlay?.view;
    if (currentView) {
      // Chỉ render nội dung cho trang đang thực sự hiển thị
      switch (currentView) {
        case "cartDrawer": renderDrawer(state); break;
        case "orderTrackerPage": openOrderTracker(state); break;
        case "placePicker": renderPlacePicker(state); break;
        case "itemDetail": renderItemDetail(state); break;
      }
    }
  }

  // 5. CÁC THÀNH PHẦN TĨNH (NavBar, CartBar, StatusBar)
  if (isCartChanged || isLangChanged || isViewChanged) {
    renderNavBar(state);
    renderCartBar(state);
    renderStatusBar(state);
  }

  // 6. XỬ LÝ ĐƠN HÀNG & THÔNG BÁO
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