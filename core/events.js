// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { translate } from "../ui/utils/translate.js";
import { getVariantById } from "./menuQuery.js";


/* ========================================================
   INTERNAL HELPERS (Không export)
   ======================================================== */

/**
 * Chuẩn hóa dữ liệu để gửi đi
 */
function buildPayload(state, type) {
  const place = state?.context?.active?.type;
  const mode = state?.context?.anchor?.type;
  const cat = getCart(state, type);

  return {
    id: cat.id,
    type: cat.type,
    timestamp: new Date().toISOString(),
    mode: cat.mode,
    place: cat.place,
    total: cat.total,
    device: navigator.userAgent,
    items: cat.items
  };
}


/**
 * Cập nhật số lượng món trong giỏ (Dùng cho nút +/- trong Drawer)
 */
// core/events.js

export function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart.items || [])]; // Clone mảng để đảm bảo tính bất biến
  const idx = items.findIndex(i => i.id === itemId);

  if (idx > -1) {
    items[idx].qty += delta;
    if (items[idx].qty <= 0) items.splice(idx, 1);
  } else if (delta > 0) {
    // NẾU CHƯA CÓ VÀ DELTA > 0 THÌ MỚI THÊM VÀO
    items.push({ id: itemId, qty: delta });
  }

  setState({ cart: { items } });
}

/**
 * Thêm món vào giỏ hàng
 */
export function addToCart(itemId) {
  // Chỉ cần gọi hàm này, nó sẽ tự xử lý việc tăng qty hoặc push mới
  updateCartQuantity(itemId, 1);

  // Hiện thông báo phản hồi (Ack)
  setState({ ack: { state: "show", status: "success", message: "Đã thêm vào giỏ hàng"  } });
  setTimeout(() => setState({ ack: { state: "hidden" } }), 1500);
}


/**
 * Xử lý Mua ngay (Gửi 1 món)
 */
export async function buyNow() {
  const state = getState();
  setState({ ack: { state: "show", status: "sending" } });

  try {
    const payload = buildPayload(state, "instant");
    const res = await sendRequest(payload);

    if (res.success) {
      finalizeOrderSuccess("instant");
    } else {
      throw new Error(res.message);
    }
  } catch (err) {
    setState({ ack: { state: "show", status: "error" } });
  }
}

/**
 * Xử lý Gửi toàn bộ giỏ hàng
 */
export async function sendCart() {
  const state = getState();
  const cartItems = state.cart.items || [];

  if (cartItems.length === 0) return;

  setState({ ack: { state: "show", status: "sending" } });

  try {
    const payload = buildPayload(state, "send-cart");
    const res = await sendRequest(payload);

    if (res.success) {
      finalizeOrderSuccess("send-cart");

      setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
    } else {
      throw new Error(res.message);
    }
  } catch (err) {
    setState({ ack: { state: "show", status: "error" } });
  }
}

/**
 * FINAL ACTION: Dọn dẹp và thông báo sau khi đơn hàng thành công
 * @param {string} type - Loại đơn ('cart', 'instant', 'recovery')
 */
// core/events.js

export function finalizeOrderSuccess(type) {
  const patch = {
    // 1. Hiện thông báo
    ack: { 
      state: "show", 
      status: "success",
      message: type === "send-cart" ? "Đơn hàng đã được gửi!" : "Yêu cầu đã được gửi!"
    },
    // 2. Đóng Overlay (Drawer/Picker)
    overlay: { view: null },
    // 3. Reset lệnh Order về ban đầu
    order: { type: null, line: null, status: "idle", at: null }
  };

  // 4. CHỐT HẠ: Nếu là đơn từ Giỏ hàng thì mới xóa sạch món
  if (type === "send-cart") {
    patch.cart = { items: [] };
  }

  setState(patch);
  
  // Tự ẩn thông báo sau 3s
  setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
}

function getCart(state, type) {
  if (type !== "cart" && type !== "instant") return null;

  let rawItems = [];
  if (type === "cart") rawItems = state.cart?.items || [];
  if (type === "instant") {
    const lineId = state.order?.line;
    rawItems = lineId ? [{ id: lineId, qty: 1 }] : [];
  }

  if (rawItems.length === 0) return null;

  let totalAmount = 0;
  let totalQty = 0;

  // 1. Chi tiết hóa từng món
  const detailedItems = rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const linePrice = info.price * cartItem.qty;

    return {
      ...cartItem,
      label: `${translate(info.productLabel)} - ${translate(info.variantLabel)}`,
      price: info.price
    };
  }).filter(Boolean);

  // 2. Tạo chuỗi tóm tắt cho Google Sheets (Ví dụ: "1x Phở bò - Tô lớn")
  const itemsSummary = detailedItems
    .map(i => `${i.qty}x ${i.label}`)
    .join(", ");

  return {
      id: `HNV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mode: translate(state.context.anchor?.type) || "",
      place: translate(state.context.active?.type) || "",
      type: type,
      items: itemsSummary // Đây là chuỗi văn bản cho cột E
  }
}