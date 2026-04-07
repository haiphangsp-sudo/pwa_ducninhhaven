// core/action.js
import { getState, setState } from "./state.js";
import { addOrderToTracking } from "./orders.js";

export async function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  if (idx === -1 && delta <= 0) return;

  let nextItems = items;

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;

    if (nextQty <= 0) {
      const element = document.querySelector(`.drawer__item[data-id="${itemId}"]`);
      if (element) {
        element.classList.add("item-exit");
        await new Promise(res => setTimeout(res, 400));
      }
      nextItems = items.filter((_, i) => i !== idx);
    } else {
      nextItems[idx] = { ...items[idx], qty: nextQty };
    }
  } else {
    nextItems.push({ id: itemId, qty: delta });
  }

  setState({
    cart: {
      ...state.cart,
      items: nextItems,
      status: "modified",
      at: Date.now()
    }
  });
}

export function resetOrderCommand(status = "idle") {
  setState({
    order: {
      action: null,
      line: null,
      status,
      at: null
    }
  });
}

export function finalizeOrderSuccess(type, payload) {
  const feedbackMap = {
    send_cart: {
      title: "Thành công",
      msg: "Giỏ hàng của bạn đã được gửi tới bếp!"
    },
    buy_now: {
      title: "Đã gửi đơn",
      msg: "Món ăn đang được chuẩn bị, xin chờ giây lát!"
    },
    recovery: {
      title: "Đã phục hồi",
      msg: "Các đơn hàng cũ đã được gửi bù thành công!"
    }
  };

  const feedback = feedbackMap[type] || feedbackMap.send_cart;

  if (payload?.id) {
    addOrderToTracking(payload.id, payload.items, {
      totalQty: payload.totalQty,
      totalPrice: payload.totalPrice,
      mode: payload.mode,
      placeLabel: payload.placeLabel,
      type: payload.type,
      device: payload.device
    });
  }

  const patch = {
    ack: {
      visible: true,
      status: "success",
      title: feedback.title,
      message: feedback.msg,
      at: Date.now()
    },
    overlay: {
      view: null
    },
    order: {
      action: null,
      line: null,
      status: "idle",
      at: null
    }
  };

  if (type === "send_cart") {
    patch.cart = {
      items: [],
      status: "idle",
      at: Date.now()
    };
  }

  setState(patch);

  setTimeout(() => {
    setState({
      ack: {
        visible: false,
        at: Date.now()
      }
    });
  }, 3500);
}