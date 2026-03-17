
import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";


const CART_KEY = "haven_cart";

/* ---------- CART ---------- */

export function dispatchAction(payload) {
  switch (payload.type) {

    case "instant":
      if (!ensureActive()) return;
      return sendInstant(payload);
  
    case "cart":
      return addToCart(payload);
    
    default:
      return;
  }
}

function ensureActive() {
  const ctx = getContext();
  if(!ctx?.active){
    openPicker();
    return false;
  }
  return true;
}

function addToCart(item) {
  
  const Items = [...(UI.cart?.items || [])];

  const existing = Items.find(i =>
    i.category===item.category &&
    i.item===item.item &&
    i.option===item.option
  );

  if(existing) existing.qty += 1;
  else Items.push({...item,qty:1});

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(Items)
  );

  setState({cart:{items:Items}});
}

/* ---------- SEND ---------- */

function sendInstant(action){
  const ctx = getContext();
  if (UI.ack.state !== "hidden") return;
  
  setState({ack:{state:"show"}});

  enqueue({
    type: "instant",
    place: ctx.active.id,
    mode: ctx.active.type,
    category: action.category,
    item: action.item,
    option: action.option,
    qty:1
  });
}

export function sendCart() {

  ensureActive();
  
  const ctx = getContext();
  if (UI.ack.state !== "hidden") return;
  
  const items = UI.cart.items || [];
  if (!items.length) return;

  enqueue({
    type: "cart",
    place: ctx.active.id,
    mode: ctx.active.type,
    item: items
  });

  setState({ack: { state: "show" }});
}

export function clearCart() {
  setState({cart: { items: [] }});
  localStorage.removeItem(CART_KEY);
}
export function loadCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    setState({ cart: { items } });
  } catch {
    clearCart();
  }
}