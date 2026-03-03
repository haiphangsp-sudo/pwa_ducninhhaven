// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../core/state.js";
import { sendCart } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");
  if(!bar) return;

  /* ---------- no items ---------- */

  if(UI.cart.items.length===0){
    bar.classList.add("hidden");
    bar.onclick=null;
    return;
  }

  bar.classList.remove("hidden");

  const count = UI.cart.items.reduce((a,b)=>a+b.qty,0);

  /* ---------- label ---------- */

  const ctx=getContext();

  let label;
  if(!ctx)
    label="select_place";
  else
    label="send_order";

  bar.innerHTML=`
    <div class="cart-label">
      ${count} · ${translate(label)}
    </div>
  `;

  /* ---------- interaction ---------- */

  if(!ctx){
    bar.onclick=()=>window.dispatchEvent(new Event("openPlacePicker"));
    bar.classList.add("need-context");
  }else{
    bar.onclick=sendCart;
    bar.classList.remove("need-context");
  }
}