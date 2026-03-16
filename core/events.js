

import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";

/* ---------- CART ---------- */

export function addToCart(item){
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

export function sendInstant(action){

  if(UI.ack.state!=="hidden") return;

  const ctx = getContext();

  if(!ctx?.active){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }

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