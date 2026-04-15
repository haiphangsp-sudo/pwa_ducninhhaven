// ui/sync.js
import { subscribe } from "../../core/state.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { showToast } from "../render/renderAck.js";
import { setupEventListeners } from "./globalEvents.js";

// Import đủ 14 hàm render của bạn
import { renderNavBar } from "../render/renderNavBar.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderItemDetail } from "../render/renderItemDetail.js";

// ĐÂY LÀ NƠI PREVSTATE RA ĐỜI
let lastState = null;
let isProcessingOrder = false;
let lastHandledOrderAt = null;

export function attachUI() {
  setupEventListeners();
  subscribe(handleSync);
}

function handleSync(state) {
  // Nếu chưa có lastState, tạo một object rỗng để không lỗi khi so sánh lần đầu
  const prevState = lastState || {};

  // 1. Đồng bộ Backdrop (Chỉ khi view thay đổi)
  if (state.overlay.view !== prevState.overlay?.view) {
    syncOverlay(state.overlay.view);
  }

  // 2. Chạy Render (Mỗi hàm tự có logic tối ưu bên trong)
  renderNavBar(state);
  renderPlacePicker(state);
  renderDrawer(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);
  renderItemDetail(state);

  // 3. Xử lý Đặt hàng (Side Effects)
  processOrders(state);

  // 4. Hiển thị Thông báo
  if (state.order?.status !== prevState.order?.status) {
    syncFeedback(state.order?.status);
  }

  // CẬP NHẬT LASTSTATE CHO LẦN SAU
  lastState = { ...state };
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

function syncFeedback(status) {
  if (!status || ["idle", "sending"].includes(status)) return;
  const config = {
    success: { type: "success", msg: "cart_bar.success" },
    error: { type: "error", msg: "cart_bar.error" },
    duplicate: { type: "info", msg: "cart_bar.duplicate" }
  }[status];
  if (config) showToast({ type: config.type, message: config.msg });
}