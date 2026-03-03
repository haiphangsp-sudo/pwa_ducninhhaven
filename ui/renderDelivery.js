// ui/renderDelivery.js
// Banner hiển thị trạng thái giao hàng (đang giao, giao thành công, giao thất bại)

import { translate } from "./utils/translate.js";

let state="idle";

export function setDeliveryState(s){
  state=s;
  render();
}

function render(){

  const el=document.getElementById("deliveryBanner");
  if(!el) return;

  if(state==="idle"){
    el.classList.add("hidden");
    return;
  }

  el.textContent= translate(`delivery.${state}`);
  el.classList.remove("hidden");

  // chỉ trạng thái lỗi mới cho tương tác
  if(state==="failed"){
    el.onclick=()=>window.dispatchEvent(new Event("resumeQueue"));
  }else{
    el.onclick=null;
  }
}