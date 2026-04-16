// ui/sync.js
import { subscribe, getState, setState } from "../../core/state.js";
import { syncOverlay } from "../interactions/backdropManager.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { showToast } from "../render/renderAck.js";
import { bootstrapOrderTracker } from "./appFlow.js";

import { renderNavBar } from "../render/renderNavBar.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderItemDetail } from "../render/renderItemDetail.js";
import { openOrderTracker } from "../components/orderTracker.js";

let lastState = null;
let isProcessingOrder = false;
let lastHandledOrderAt = null;

export function attachUI() {
  bootstrapOrderTracker(); 
  subscribe(syncUI);
  syncUI(getState()); 
}

function syncUI(state) {
  if (!state) return;
  const prevState = lastState || {};

  // --- 1. SO SÁNH THAY ĐỔI (Dùng "at" và Key so sánh) ---
  const isViewChanged = state.overlay?.view !== prevState.overlay?.view;
  const isLangChanged = state.lang?.current !== prevState.lang?.current;
  const isCartChanged = JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items);
  
  // So sánh timestamp cập nhật của đơn hàng (quan trọng để thoát SYNCING)
  const currentOrderAt = state.orders?.active?.[0]?.updatedAt || 0;
  const prevOrderAt = prevState.orders?.active?.[0]?.updatedAt || 0;
  const isOrdersChanged = currentOrderAt !== prevOrderAt;

  // Kiểm tra chọn bàn/phòng (để tự quay lại Giỏ)
  const isPlaceSelected = state.cart?.placeId !== prevState.cart?.placeId;

  // --- 2. PHẢN HỒI TOAST (Gửi đơn thành công/thất bại) ---
  if (state.order?.status !== prevState.order?.status) {
    syncOrderFeedback(state,prevState);
  }

  // --- 3. TỰ ĐỘNG QUAY LẠI GIỎ HÀNG (Picker Flow) ---
  if (isPlaceSelected && state.overlay?.view === "placePicker") {
    // Nếu chọn bàn xong, tự động trả về giao diện Giỏ hàng
    setTimeout(() => {
      setState({ overlay: { view: "cartDrawer" } });
    }, 250);
  }

  // --- 4. CẬP NHẬT GIAO DIỆN TĨNH (NavBar, CartBar, StatusBar) ---
  if (isCartChanged || isLangChanged || isViewChanged || isOrdersChanged) {
    renderNavBar(state);
    renderCartBar(state);
    renderStatusBar(state);
  }

  // --- 5. CẬP NHẬT NỘI DUNG CHÍNH (Hub & Panel) ---
  if (isLangChanged || isViewChanged) {
    renderHub(state);
    renderPanel(state);
  }

  // --- 6. QUẢN LÝ OVERLAY & TRANG CHI TIẾT ---
  if (isViewChanged || isLangChanged || isOrdersChanged) {
    syncOverlay(state.overlay?.view);
    const view = state.overlay?.view;

    if (view === "cartDrawer") renderDrawer(state);
    if (view === "placePicker") renderPlacePicker(state);
    if (view === "itemDetail") renderItemDetail(state);
    
    // Nếu dữ liệu đơn hàng đổi hoặc đang mở trang Tracker -> Vẽ lại chi tiết
    if (view === "orderTrackerPage" && (isOrdersChanged || isLangChanged)) {
      openOrderTracker();
    }
  }

  // --- 7. SIDE EFFECTS (Lưu trữ & Xử lý đơn) ---
  syncStorage(state, prevState);
  processOrders(state);

  // CHỐT CHẶN CUỐI: Cập nhật "trí nhớ"
  lastState = JSON.parse(JSON.stringify(state));
}

function syncOrderFeedback(state, prevState) {
  const orderChanged =
    state.order.status !== prevState.order?.status ||
    state.order.action !== prevState.order?.action ||
    state.order.line !== prevState.order?.line ||
    state.order.at !== prevState.order?.at;

  if (!orderChanged) return;

  switch (state.order?.status) {
    case "error":
      showToast({ type: "error", message: "cart_bar.error", duration: 2500 });
      break;

    case "duplicate":
      showToast({ type: "info", message: "cart_bar.duplicate", duration: 2500 });
      break;

    case "success":
      showToast({ type: "success", message: "cart_bar.success", duration: 2500 });
      break;

    case "sending":
      showToast({ type: "sending", message: "cart_bar.sending" });
      break;

    case "added":
      showToast({ type: "success", message: "cart_bar.added" });
      break;

    case "idle":
      //showToast({ type: "idle", message: "cart_bar.idle" });
      break;

    default:
      break;
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

function syncStorage(state, prevState) {
  if (JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items)) {
    localStorage.setItem("haven_cart", JSON.stringify(state.cart?.items || []));
  }
  if (state.lang?.current !== prevState.lang?.current) {
    localStorage.setItem("haven_lang", state.lang?.current);
  }
}