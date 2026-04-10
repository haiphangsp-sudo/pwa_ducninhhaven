// core/action.js
import { getState, setState } from "./state.js";

async function animateItemExit(itemId) {
  const el = document.querySelector(`.drawer__item[data-id="${itemId}"]`);
  if (!el) return;
  el.classList.add("item-exit");
  await new Promise(resolve => setTimeout(resolve, 400));
}

export async function updateCartQuantity(itemId, delta) {
  const state = getState();
  const items = [...(state.cart?.items || [])];
  const idx = items.findIndex(i => i.id === itemId);

  if (idx === -1 && delta <= 0) return;

  let nextItems = items;

  if (idx > -1) {
    const nextQty = (Number(items[idx].qty) || 0) + delta;

    if (nextQty <= 0) {
      await animateItemExit(itemId);
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