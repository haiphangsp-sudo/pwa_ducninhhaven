// core/actions.js
//   Các hành động chính của app, bao gồm thêm vào giỏ hàng, gửi yêu cầu đến server, v.v.
//   Các component sẽ gọi các hàm này để thực hiện hành động, thay vì thao tác trực tiếp với state hoặc queue


import { getActivePlace } from "./context.js";
import { UI, setState } from "./state.js";
import { enqueue } from "./queue.js";
import { getContext } from "./context.js";

/* ---------- CART ---------- */

export function addToCart(item){

  const existing = UI.cart.items.find(i =>
    i.category===item.category &&
    i.item===item.item &&
    i.option===item.option
  );

  if(existing) existing.qty++;
  else UI.cart.items.push({...item,qty:1});

  setState({cart:{items:UI.cart.items}});
}

/* ---------- SEND ---------- */

export function sendInstant(action){

  const ctx = getContext();

  if(!ctx?.active){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }

  enqueue({
    type:"instant",
    target: ctx.active.id,
    category: action.category,
    item: action.code,
    option: "",
    qty: 1,
    ts: Date.now()
  });

  setState({ack:{state:"show"}});
}

export function sendCart(){

  const ctx = getContext();

  if(!ctx?.active){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }

  enqueue({
    type:"cart",
    target: ctx.active.id,
    items: UI.cart.items,
    ts: Date.now()
  });

  setState({
    ack:{state:"show"},
    cart:{items:[]}
  });
}