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

  // 1. Tạo "Ảnh chụp cũ" để so sánh
  // Nếu là lần đầu, tạo một object rỗng để không bị lỗi undefined
  const prevState = lastState ? JSON.parse(JSON.stringify(lastState)) : {};

  // 2. CẬP NHẬT TRÍ NHỚ NGAY LẬP TỨC
  // Dòng này cực kỳ quan trọng để chặn vòng lặp vô tận từ showToast
  lastState = JSON.parse(JSON.stringify(state));

  // 3. SO SÁNH VÀ RENDER (Chỉ vẽ lại khi dữ liệu liên quan thay đổi)
  
  // Overlay & Backdrop
  if (state.overlay?.view !== prevState.overlay?.view || state.overlay?.value !== prevState.overlay?.value) {
    syncOverlay(state.overlay.view);
    if (state.overlay.view === "cartDrawer") renderDrawer(state);
    if (state.overlay.view === "placePicker") renderPlacePicker(state);
    if (state.overlay.view === "itemDetail") renderItemDetail(state);
  }

  // Giỏ hàng (Nút +/- sẽ hoạt động lại nhờ dòng này)
  if (JSON.stringify(state.cart?.items) !== JSON.stringify(prevState.cart?.items)) {
    renderCartBar(state);
    renderStatusBar(state); // Cập nhật tổng tiền ở thanh trạng thái
  }

  // Ngôn ngữ
  if (state.lang?.current !== prevState.lang?.current) {
    renderNavBar(state);
    renderCartBar(state);
    renderStatusBar(state);
  }

  // Panel & Hub
  if (state.panel?.view !== prevState.panel?.view) {
    renderPanel(state);
  }

  // 4. XỬ LÝ ĐẶT HÀNG (Side Effects)
  processOrders(state);

  // 5. THÔNG BÁO (Toast)
  // Chỉ hiện thông báo nếu status thực sự thay đổi (ví dụ từ 'sending' sang 'success')
  if (state.order?.status !== prevState.order?.status) {
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