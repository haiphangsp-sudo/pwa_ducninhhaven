// ui/renderCart.js
// Thanh giỏ dưới cùng (state-driven)

import { UI } from "../core/state.js";
import { sendCart } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";
import { MENU } from "../core/menuStore.js";

export function renderCartBar(){

  const bar = document.getElementById("cartBar");
  const Count = document.getElementById("cartCount");
  const total = UI.cart.items.reduce((a,b)=>a+b.qty,0);
  if(total>1){
    Count.textContent = `${total} ${translate("cart_bar.items")}`;
  } else {
    Count.textContent = `${total} ${translate("cart_bar.item")}`;
  }
  const ctx = getContext();

  const cartBtn = document.getElementById("cartOpen");

  let textOpen = "";

  if(total==0){
    bar.classList.add("hidden");
    return;
  }else{
    bar.classList.remove("hidden");
  }
  
  if(!ctx){
    textOpen="cart_bar.select_place";
    bar.classList.remove("hidden");
    cartBtn.onclick = ()=>window.dispatchEvent(new Event("openPlacePicker"));
    
  }else{
    cartBtn.onclick = openCartDrawer;
    textOpen="cart_bar.cart_title";
  }
  
  cartBtn.textContent=translate(textOpen);
}

// - Lưu giỏ hàng vào localStorage để giữ nguyên khi reload trang
export function loadCart(){
  const saved = localStorage.getItem("haven_cart");//
  if(saved) {
    UI.cart = JSON.parse(saved);
    renderCartBar();
  }
}

export function openCartDrawer(){

  renderDrawer();
  document.getElementById("cartDrawer").classList.remove("hidden");
}

function renderDrawer(){
  let textOrder="";
  if(UI.delivery.state==="sending"){
    textOrder="delivery.pending";
  }else{
    textOrder= "cart_bar.send_order";
  }
  document.getElementById("drawerSend").textContent = translate(textOrder);
  document.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

  const el=document.getElementById("drawerItems");

  el.innerHTML="";
  UI.cart.items.forEach((i,index)=>{
    const ItemDrawer = i.item;
    const OptionDrawer = i.option;
    const row=document.createElement("div");
    row.className="drawer-item";
    row.innerHTML=`
      <div>
        <strong>${ItemDrawer}</strong>
        <div>${OptionDrawer}</div>
      </div>
      <div class="drawer-qty">
        <button data-i="${index}" class="qty-minus">−</button>
        <span>${i.qty}</span>
        <button data-i="${index}" class="qty-plus">+</button>
      </div>
    `;
    el.appendChild(row);
  });
  
    document.getElementById("drawerClose").onclick = closeCartDrawer;
    document.querySelector(".drawer-backdrop").onclick = closeCartDrawer;
    document.getElementById("drawerSend").onclick=()=>{ 
      sendCart(); 
      closeCartDrawer();
      el.innerHTML="";
     };
}

export function closeCartDrawer(){

  document.getElementById("cartDrawer").classList.add("hidden");

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

    if(UI.cart.items[i].qty<=0){
      UI.cart.items.splice(i,1);
    }
    if(UI.cart.items.length==0){
      closeCartDrawer();
    }
    renderDrawer();
    renderCartBar();

  }
   
});

  