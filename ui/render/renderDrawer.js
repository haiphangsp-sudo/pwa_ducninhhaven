 //    ui/render/renderDrawer.js


import { showOverlay, closeOverlay } from "../../ui/interactions/overlayManager.js"
import { sendCart } from "../../core/events.js";
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { MENU } from "../../core/menuStore.js";


export function openCartDrawer(){
  renderDrawer();
  showOverlay("cartDrawer");
}
  
function renderDrawer(textTotal){
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
  
    document.getElementById("drawerClose").onclick = closeOverlay();
    document.getElementById("drawerSend").onclick=()=>{ 
      sendCart(); 
      closeOverlay();
      el.innerHTML="";
     };
}

document.addEventListener("click",(e)=>{

  if(e.target.classList.contains("qty-plus")){

    const i=e.target.dataset.i;
    UI.cart.items[i].qty++;

    renderDrawer();
    updateTotal(i);
  }

  if(e.target.classList.contains("qty-minus")){

    const i=e.target.dataset.i;

    UI.cart.items[i].qty--;

    if(UI.cart.items[i].qty<=0){
      UI.cart.items.splice(i,1);
    }
    if(UI.cart.items.length==0){
      closeOverlay();
    }
    renderDrawer();
    updateTotal(i);
  }
});
