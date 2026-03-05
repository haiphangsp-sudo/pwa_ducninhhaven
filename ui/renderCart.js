// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../core/state.js";
import { sendCart } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");
  const count = document.getElementById("cartCount");
  const total = UI.cart.items.reduce((a,b)=>a+b.qty,0);

  const ctx = getContext();

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

// - Lưu giỏ hàng vào localStorage để giữ nguyên khi reload trang
export function loadCart(){
  const saved = localStorage.getItem("haven_cart");//
  if(saved) UI.cart = JSON.parse(saved);
}

export function openCartDrawer(){

  const drawer=document.getElementById("cartDrawer");
  drawer.classList.remove("hidden");

  renderDrawer();

}

function renderDrawer(){
  document.getElementsByClassName(".drawer-title").textContent = translate("cart_bar.drawer_title");
  document.getElementById("drawerSend").textContent = translate("cart_bar.send_order");
  const el=document.getElementById("drawerItems");

  el.innerHTML="";

  UI.cart.items.forEach((i,index)=>{

    const row=document.createElement("div");

    row.className="drawer-item";

    row.innerHTML=`

      <div>
        <strong>${i.item}</strong>
        <div>${i.option}</div>
      </div>

      <div class="drawer-qty">
        <button data-i="${index}" class="qty-minus">−</button>
        <span>${i.qty}</span>
        <button data-i="${index}" class="qty-plus">+</button>
      </div>

    `;

    el.appendChild(row);
    document.getElementById("drawerClose").onclick = closeCartDrawer;
  });

}

export function closeCartDrawer(){

  document.getElementById("cartDrawer")
    .classList.add("hidden");

}

document.addEventListener("click",(e)=>{

  if(e.target.classList.contains("qty-plus")){

    const i=e.target.dataset.i;
    UI.cart.items[i].qty++;

    renderDrawer();
    renderCartBar();

  }

  if(e.target.classList.contains("qty-minus")){

    const i=e.target.dataset.i;

    UI.cart.items[i].qty--;

    if(UI.cart.items[i].qty<=0)
      UI.cart.items.splice(i,1);

    renderDrawer();
    renderCartBar();

  }
   document
  .getElementById("drawerSend")
  .onclick=sendCart;
});

document
  .getElementById("cartBar")
  .onclick=openCartDrawer;
