// core/events.js

import { getState, setState } from "./state.js";
import { sendRequest } from "../services/api.js";
import { getVariantById } from "./menuQuery.js";
import { getActivePlaceId, getActivePlaceType, getContext} from "../core/context.js";
import { getLocationLabel } from "../data/helpers.js";
import { notifyResponse } from "./action.js"
import { renderStatusBar, animateFlyToCart } from "../ui/render/renderStatusBar.js"


/* ========================================================
   1. UI FEEDBACK HELPERS
   ======================================================== */

function showAck(status, message = "", timeout = 1500) {
  setState({
    ack: { visible: true, status, message, at: Date.now() }
  });

  // Nếu có set timeout, tự động đóng sau x giây
  if (timeout > 0) {
    setTimeout(() => {
      setState({
        ack: { visible: false, status: null, message: "", at: null }
      });
    }, timeout);
  }
}
/* ========================================================
   3. CART ACTIONS
   ======================================================== */
export async function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  // Nếu không tìm thấy và delta <= 0 thì thoát luôn
  if (idx === -1 && delta <= 0) return;

  let nextItems = items;

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;

    if (nextQty <= 0) {
      // XỬ LÝ ANIMATION KHI XÓA MÓN
      const element = document.querySelector(`.drawer__item[data-id="${itemId}"]`);
      if (element) {
        element.classList.add("item-exit");
        // Đợi animation (ví dụ 400ms) để khách thấy món ăn biến mất mượt mà
        await new Promise(res => setTimeout(res, 400));
      }
      // Lọc bỏ món ăn ra khỏi danh sách
      nextItems = items.filter((_, i) => i !== idx);
    } else {
      // Cập nhật số lượng
      nextItems[idx] = { ...items[idx], qty: nextQty };
    }
  } else {
    // Thêm món mới vào giỏ
    nextItems.push({ id: itemId, qty: delta });
  }

  // CHỈ GỌI SETSTATE MỘT LẦN DUY NHẤT Ở ĐÂY
  setState({ 
    cart: { 
      ...state.cart, 
      items: nextItems, 
      status: "modified",
      at: Date.now() // Kích hoạt syncUI
    }
  });
}

export function addToCart(e) {
  const state = getState();
  const itemId = state.order?.line;
  if (!itemId) return;
  console.log(e.target.dataset.id);
  if (e && e.target) {
    animateFlyToCart(e.target);
  }
  updateCartQuantity(itemId, 1);

  //showAck("success", "cart_bar.added");
}


const getSourceItems = (state, action) => {
  if (action === "send_cart") return state.cart?.items || [];
  if (state.order?.line) return [{ id: state.order.line, qty: 1 }];
  return [];
};
const formatItemsForGAS = (rawItems) => {
  return rawItems.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;
    return {
      id: cartItem.id,
      category: info.categoryKey || "",
      item: info.productLabel,
      option: info.variantLabel,
      qty: Number(cartItem.qty || 1),
      price: Number(info.price || 0),
      subtotal: Number(info.price || 0) * Number(cartItem.qty || 1)
    };
  }).filter(Boolean);
};
function buildPayload(state, action) {
  const placeId = getActivePlaceId();
  const placeType = getActivePlaceType();
  if (!placeId) return null;

  const rawItems = getSourceItems(state, action);
  if (rawItems.length === 0) return null;

  const formattedItems = formatItemsForGAS(rawItems);
  if (formattedItems.length === 0) return null;

  return {
    id: `H-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: action,
    timestamp: new Date().toISOString(),
    place: placeId,
    placeLabel: getLocationLabel(),
    mode: placeType,
    items: formattedItems,
    device: navigator.userAgent
  };
}
export async function submitOrder(action) {
  const state = getState();
  const payload = buildPayload(state, action);
  
  if (!payload) return false;

  // Cập nhật UI sang trạng thái gửi
  setState({ order: { ...state.order, status: "pending" } });
  showAck("sending", "cart_bar.sending", 0);
  try {
    const res = await sendRequest(payload);
    if (res?.success) {
      finalizeOrderSuccess(action);
      notifyResponse(res, payload);
      showAck("success", "cart_bar.success", 3000);
      return true;
    }
    throw new Error("API_FAIL");
  } catch (error) {
    setState({ order: { ...getState().order, status: "error" } });
    showAck("error", "cart_bar.error", 2500);
    notifyResponse(error, payload);
    return false;
  } finally {
    setState({ ui: { isOrdering: false } });
  }
}
export function onOrderSuccess(orderId, items) {
  // Chỉ xóa giỏ hàng nếu đó là đơn hàng gửi từ giỏ (CART)
  // Bạn có thể thêm logic check type ở đây nếu cần
  
  // Cập nhật StatusBar
  const newOrder = {
    id: orderId,
    status: 'pending',
    items: items,
    time: new Date().toISOString()
  };
  
  const currentOrders = getState().orders?.active || [];
  setState({ orders: { active: [newOrder, ...currentOrders] } });
  renderStatusBar();
}

/**
 * FINAL ACTION: Dọn dẹp và thông báo sau khi đơn hàng thành công
 * @param {string} type - Loại đơn ('cart', 'instant', 'recovery')
 */
export function finalizeOrderSuccess(type) {
  // 1. Bản đồ thông báo theo loại đơn hàng
  const feedbackMap = {
    send_cart: { title: "Thành công", msg: "Giỏ hàng của bạn đã được gửi tới bếp!" },
    buy_now: { title: "Đã gửi đơn", msg: "Món ăn đang được chuẩn bị, xin chờ giây lát!" },
    recovery: { title: "Đã phục hồi", msg: "Các đơn hàng cũ đã được gửi bù thành công!" }
  };

  const feedback = feedbackMap[type] || feedbackMap.cart;

  // 2. Chuẩn bị bản cập nhật State
  const patch = {
    ack: { 
      visible: true, 
      status: "success",
      title: feedback.title,
      message: feedback.msg
    },
    overlay: { view: null } // Đóng mọi cửa sổ (Drawer/Picker)
  };

  // 3. Chỉ xóa giỏ hàng nếu là đơn từ giỏ
  if (type === "send_cart") {
    patch.cart = { items: [], status: 'idle' };
  }

  // Thực thi cập nhật State
  setState(patch);

  // 4. Tự động ẩn thông báo sau 3.5 giây
  setTimeout(() => {
    setState({ ack: { state: "hidden" } });
  }, 3500);
}