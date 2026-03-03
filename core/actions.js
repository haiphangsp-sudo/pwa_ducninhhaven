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

  const ctx=getContext();
  if(!ctx){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }

  enqueue({
    target:ctx.id,
    action,
    ts:Date.now()
  });

  setState({ack:{state:"show"}});
}
export function sendCart(){

  const place = getActivePlace();

  if(!place){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }

  enqueue({
    target:place.id,
    action:{kind:"order"},
    payload:{
      items:UI.cart.items,
      ts:Date.now()
    }
  });

  setState({
    ack:{state:"show"},
    cart:{items:[]}
  });
}