// ui/sync.js
import { subscribe, getState } from "../../core/state.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { showToast } from "../render/renderAck.js";
import { setupEventListeners } from "./globalEvents.js";
import { bootstrapOrderTracker } from "./appFlow.js";

// --- Imports các hàm Render ---
import { renderNavBar } from "../render/renderNavBar.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderItemDetail } from "../render/renderItemDetail.js";

let lastState = null;
let isProcessingOrder = false;
let lastHandledOrderAt = null;

export function attachUI() {
  setupEventListeners();
  bootstrapOrderTracker(); 
  subscribe(syncUI);
  syncUI(getState()); // Chạy lần đầu để nạp UI
}

function syncUI(state) {
  if (!state) return;

  // 1. CHUẨN BỊ: Xác định những gì đã thay đổi TRƯỚC khi cập nhật lastState
  const prevState = lastState || {};
  
  const isViewChanged = state.overlay?.view !== prevState.overlay?.view;
  const isCartChanged = JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items);
  const isLangChanged = state.lang?.current !== prevState.lang?.current;
  const isStatusChanged = state.order?.status !== prevState.order?.status;

  // 2. CHẶN LOOP: Cập nhật trí nhớ ngay lập tức
  lastState = JSON.parse(JSON.stringify(state));

  // 3. RENDER THEO ĐIỀU KIỆN (Logic "Boutique" - Chỉ vẽ cái cần thiết)

  // Nếu view đổi HOẶC giỏ hàng đổi khi đang mở Drawer -> Vẽ lại Drawer
  if (isViewChanged || (state.overlay?.view === "cartDrawer" && isCartChanged) || isLangChanged) {
    if (state.overlay?.view === "cartDrawer") renderDrawer(state);
    if (state.overlay?.view === "placePicker") renderPlacePicker(state);
    if (state.overlay?.view === "itemDetail") renderItemDetail(state);
    
    // Đồng bộ lớp nền Backdrop khi đổi view
    if (isViewChanged) syncOverlay(state.overlay?.view);
  }

  // Nếu giỏ hàng đổi -> Vẽ lại các thanh trạng thái ngoài màn hình
  if (isCartChanged || isLangChanged) {
    renderCartBar(state);
    renderStatusBar(state);
  }

  // Render các thành phần tĩnh khác
  renderNavBar(state);
  renderHub(state);
  
  if (state.panel?.view !== prevState.panel?.view) {
    renderPanel(state);
  }

  // 4. XỬ LÝ ĐẶT HÀNG (Side Effects)
  processOrders(state);

  // 5. THÔNG BÁO (Toast)
  if (isStatusChanged) {
    syncOrderFeedback(state.order?.status);
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