
import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";


/* ---------- CART ---------- */

export function dispatchAction(payload) {
  if(!ensureActive()) return;
  if(payload.type==="instant"){
    sendInstant(payload);
  }
  if(payload.type==="cart"){
    addToCart(payload);
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

function addToCart(item){
  const Items = UI.cart?.items || [];
  const existing = Items.find(i =>
    i.category===item.category &&
    i.item===item.item &&
    i.option===item.option
  );

  if(existing) existing.qty += 1;
  else Items.push({...item,qty:1});

  localStorage.setItem(
    "haven_cart",
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
    mode: ctx.active.id,
    place: ctx.active.type,
    category: action.category,
    item: action.item,
    option: action.option || "default",
    qty:1
  });
}

export function sendCart(){
  const ctx = getContext();
  if(UI.ack.state!=="hidden") return;
  const items = UI.cart.items;
  enqueue({
    type: "cart",
    mode: ctx.active.id,
    place: ctx.active.type,
    item: items
  });

  setState({
    ack:{state:"show"},
    cart:{items:[]}
  });

  localStorage.removeItem("haven_cart");
}