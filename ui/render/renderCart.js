// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../../core/state.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { openCartDrawer } from "./renderDrawer.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");  
  const ctx = getContext();
  const cartBtn = document.getElementById("cartOpen");
  const Items = UI.cart?.items || [];
  const total = Items.reduce((a, b) => a + b.qty, 0);
  
  if(total==0){
    bar.classList.add("hidden");
    return;
  } else {
    updateTotal();
    bar.classList.remove("hidden");
  }
  
  if(!ctx) bar.classList.remove("hidden");
  
  cartBtn.textContent=translate("cart_bar.cart_title");
  cartBtn.onclick = openCartDrawer;
}
export function updateTotal() {
  const total = UI.cart.items.reduce((a, b) => a + b.qty, 0);
  let textTotal;
  if(total>1){
    textTotal = `${total} ${translate("cart_bar.items")}`;
  } else {
    textTotal = `${total} ${translate("cart_bar.item")}`;
  }
  document.getElementById("cartCount").textContent = textTotal;
  document.querySelector(".drawer-total").textContent = textTotal;

}
// - Lưu giỏ hàng vào localStorage để giữ nguyên khi reload trang
export function loadCart(){
  const saved = localStorage.getItem("haven_cart");
  if(saved) {
    UI.cart = JSON.parse(saved);
    renderCartBar();
  }
}
