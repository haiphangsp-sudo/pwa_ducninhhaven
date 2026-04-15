// ui/sync.js
import { subscribe } from "../../core/state.js";
import { syncOverlay } from "../../ui/interactions/backdropManager.js";
import { submitOrder, addToCart } from "../../core/events.js";
import { showToast } from "../render/renderAck.js";

// Import tất cả các hàm Render bạn đã có
import { renderPlacePicker } from "../render/renderPlacePicker.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderItemDetail } from "../render/renderItemDetail.js";

let lastHandledOrderAt = null;
let isProcessingOrder = false;

export function initSync() {
  // Đăng ký lắng nghe sự thay đổi của State
  subscribe(handleSync);
}

function handleSync(state, prevState) {
  // 1. Kiểm tra những thay đổi lớn để tránh render thừa (Performance)
  const overlayChanged = state.overlay.view !== prevState.overlay?.view;
  const contextChanged = JSON.stringify(state.context) !== JSON.stringify(prevState.context);
  const cartChanged = state.cart?.items !== prevState.cart?.items;

  // 2. Đồng bộ các thành phần giao diện (UI Rendering)
  // Mỗi hàm render sẽ tự quyết định có cần vẽ lại dựa trên state hay không
  if (overlayChanged) syncOverlay(state.overlay.view);
  
  renderNavBar(state);
  renderPlacePicker(state);
  renderDrawer(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);
  renderItemDetail(state);

  // 3. Xử lý tác vụ đặt hàng (Side Effects - GAS/Sheets)
  processOrderCommands(state);

  // 4. Phản hồi người dùng (Toasts/Feedback)
  if (state.order?.status !== prevState.order?.status) {
    handleOrderFeedback(state.order?.status);
  }
}

/**
 * Hàm xử lý gửi dữ liệu lên Server hoặc thêm vào giỏ hàng
 */
async function processOrderCommands(state) {
  const { action, at } = state.order || {};
  
  // Chặn gửi trùng đơn hoặc đang trong quá trình xử lý
  if (!action || at === lastHandledOrderAt || isProcessingOrder) return;

  lastHandledOrderAt = at;
  isProcessingOrder = true;

  try {
    switch (action) {
      case "add_cart":
        addToCart(); 
        break;
      case "buy_now":
      case "send_cart":
        await submitOrder(action);
        break;
    }
  } catch (error) {
    console.error("Order process error:", error);
  } finally {
    isProcessingOrder = false;
  }
}

/**
 * Quản lý thông báo dựa trên trạng thái đơn hàng
 */
function handleOrderFeedback(status) {
  if (!status || status === "idle" || status === "sending") return;

  const configMap = {
    success: { type: "success", text: "cart_bar.success" },
    error: { type: "error", text: "cart_bar.error" },
    duplicate: { type: "info", text: "cart_bar.duplicate" }
  };

  const config = configMap[status];
  if (config) {
    showToast({ 
      type: config.type, 
      message: config.text, 
      duration: 2500 
    });
  }
}