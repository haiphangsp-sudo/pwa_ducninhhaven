// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../core/state.js";
import { sendCart } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");
  const count = document.getElementById("cartCount");
  const items = UI.cart.items;
  const total = items.reduce((a,b)=>a+b.qty,0);

  //const count = UI.cart.items.reduce((a,b)=>a+b.qty,0);

  const ctx = getContext();

  //const countEl = document.getElementById("cartCount");
  const sendBtn = document.getElementById("cartSend");
  sendBtn.disabled = total===0;
  let textOrder = "select_place";
  //countEl.textContent = count;
  if(total==0){
    bar.classList.add("hidden");
    return;
  }else{
    bar.classList.remove("hidden");
  }
  
  if(!ctx){
    textOrder="select_place";
    sendBtn.onclick = ()=>window.dispatchEvent(new Event("openPlacePicker"));
    bar.classList.add("need-context");
  }else{
    sendBtn.onclick = sendCart;
    bar.classList.remove("need-context");
    if(UI.delivery.state==="sending"){
      textOrder="delivery.pending";
    }
    textOrder="cart_bar.send_order";
  }
  count.textContent = `${total} ${translate("cart_bar.items")}`;
  sendBtn.textContent=translate(textOrder);
}
export function openCartDrawer(){

  const drawer=document.getElementById("cartDrawer");
  drawer.classList.remove("hidden");

  renderDrawer();

}

export function closeCartDrawer(){

  document.getElementById("cartDrawer")
    .classList.add("hidden");

}