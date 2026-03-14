 //    ui/render/renderDrawer.js

import { updateTotal } from "./renderCart.js";
import { showOverlay, closeOverlay } from "../../ui/interactions/overlayManager.js"
import { sendCart } from "../../core/events.js";
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { MENU } from "../../core/menuStore.js";


export function openCartDrawer(){
  renderDrawer();
  showOverlay("cartDrawer");
}
  
function renderDrawer(){
  let textOrder="";
  if(UI.delivery.state==="sending"){
    textOrder="delivery.pending";
  }else{
    textOrder= "cart_bar.order";
  }
  document.getElementById("drawerSend").textContent = translate(textOrder);
  document.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

  const el=document.getElementById("drawerItems");

  el.innerHTML="";
  UI.cart.items.forEach((i,index)=>{
    const ItemDrawer = translate(MENU[i.category].items[i.item].label);
    const OptionDrawer = translate(MENU[i.category].items[i.item].options[i.option].label);
    const row=document.createElement("div");
    row.className = "drawer-item";
    row.dataset.i = index;
    row.innerHTML=`
      <div>
        <strong>${ItemDrawer}</strong>
        <div>${OptionDrawer}</div>
      </div>
      <div class="drawer-qty">
        <button data-i="${index}" class="qty-minus">−</button>
        <span class="qty">${i.qty}</span>
        <button data-i="${index}" class="qty-plus">+</button>
      </div>
    `;
    el.appendChild(row);
  });
  
  document.getElementById("drawerSend").onclick=()=>{ 
    sendCart(); 
    closeOverlay();
    el.innerHTML="";
  };
  document.getElementById("drawerClose").onclick = closeOverlay;
}

document.addEventListener("click", (e) => {
  
  const i = e.target.dataset.i;
  const row = e.target.closest(".drawer-item");
  
  if(e.target.classList.contains("qty-plus")){
    UI.cart.items[i].qty++;
  }

  if (e.target.classList.contains("qty-minus")) {

    UI.cart.items[i].qty--;

    if (UI.cart.items[i].qty <= 0) {
      UI.cart.items.splice(i, 1);
    
      if (UI.cart.items.length == 0) {
        document.getElementById("drawerItems").innerHTML = "";
        closeOverlay();
        return;
      }
      reindexDrawer();
    }
  }
  row.querySelector(".qty").textContent = UI.cart.items[i]?.qty||0;
  updateTotal();

});

function reindexDrawer() {
  document
    .querySelectorAll(".drawer-item")
    .forEach((row, i) => {
      row.dataset.i = i;
    });
}