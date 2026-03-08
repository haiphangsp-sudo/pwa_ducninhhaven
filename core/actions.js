// core/actions.js
//   Các hành động chính của app, bao gồm thêm vào giỏ hàng, gửi yêu cầu đến server, v.v.
//   Các component sẽ gọi các hàm này để thực hiện hành động, thay vì thao tác trực tiếp với state hoặc queue


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
  else UI.cart.items.push({...item,qty:1.0});

  localStorage.setItem(
    "haven_cart",
    JSON.stringify(UI.cart.items)
  );

  setState({cart:{items:UI.cart.items}});
  document.getElementById("cartBar")
  ?.classList.add("cart-bounce");
  setTimeout(()=>{
    document.getElementById("cartBar")
    ?.classList.remove("cart-bounce");
  },250);
}

/* ---------- SEND ---------- */

export function sendInstant(action){

  if(UI.ack.state!=="hidden") return; // tránh gửi nhiều
  const ctx = getContext();

  if(!ctx?.active){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }
  setState({ack:{state:"show"}});

  enqueue({
    id: active.id,
    type: active.type,
    target: ctx.active.id,
    category: action.category,
    item: action.code,
    option: action.option,
    qty: 1,
    ts: Date.now()
  });

}

export function sendCart(){

  if(UI.ack.state!=="hidden") return; // tránh gửi nhiều
  const ctx = getContext();

  if(!ctx?.active){
    window.dispatchEvent(new Event("openPlacePicker"));
    return;
  }

  enqueue({
    id: active.id,
    type: active.type,
    target: ctx.active.id,
    items: UI.cart.items,
    ts: Date.now()
  });

  setState({
    ack:{state:"show"},
    cart:{items:structuredClone(UI.cart.items)}
  });

  localStorage.removeItem("haven_cart");
}
