

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";
import { openPicker } from "../ui/components/placePicker.js";


/* ---------- CART ---------- */

export function dispatchAction(payload) {
  if(!ensureActive()) return;
  if(payload.ui==="instant"){
    sendInstant(payload);
  }
  if(payload.ui==="cart"){
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

  const bar=document.getElementById("cartBar");
  bar?.classList.add("cart-bounce");

  setTimeout(()=>{
    bar?.classList.remove("cart-bounce");
  },250);
}

/* ---------- SEND ---------- */

function sendInstant(action){
  const ctx = getContext();
  if (UI.ack.state !== "hidden") return;
  
  setState({ack:{state:"show"}});

  enqueue({
    type: "instant",
    place: ctx.active.id,
    placeType: ctx.active.type,
    category: action.category,
    item: action.code,
    option: action.option || "default",
    qty:1
  });
}

export function sendCart(){
  const ctx = getContext();
  if(UI.ack.state!=="hidden") return;

  enqueue({
    type: "cart",
    place: ctx.active.id,
    placeType: ctx.active.type,
    items: structuredClone(UI.cart.items)
  });

  setState({
    ack:{state:"show"},
    cart:{items:[]}
  });

  localStorage.removeItem("haven_cart");
}