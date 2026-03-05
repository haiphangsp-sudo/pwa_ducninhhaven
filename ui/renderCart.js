// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../core/state.js";
import { sendCart } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");
  if(!bar) return;

  const count = UI.cart.items.reduce((a,b)=>a+b.qty,0);

  const ctx = getContext();

  const countEl = document.getElementById("cartCount");
  const sendBtn = document.getElementById("cartSend");
  let textOrder = "select_place";
  countEl.textContent = count;

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
    textOrder="send_order";
  }
  sendBtn.textContent=translate(textOrder);
}
