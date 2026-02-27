// ui/renderCart.js
//Thanh giỏ dưới cùng.
import { UI } from "../core/state.js";
import { actionSendCart } from "../core/dispatcher.js";
import { t } from "../data/i18n.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");

  if(UI.cart.items.length===0){
    bar.classList.add("hidden");
    return;
  }

  bar.classList.remove("hidden");

  const count = UI.cart.items.reduce((a,b)=>a+b.qty,0);

  bar.innerHTML = `
    <div>${count} items · ${t("order")}</div>
  `;

  bar.onclick=actionSendCart;
}