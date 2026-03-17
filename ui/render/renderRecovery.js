// ui/renderRecovery.js
// Banner hiển thị khi phát hiện có yêu cầu chưa gửi (do mất mạng hoặc đóng app đột ngột)

import { translate } from "../utils/translate.js";
import { showOverlay, closeOverlay } from "../interactions/overlayManager.js";


let state="idle";

export function setRecoveryState(s){
  state=s;
  render();
}

function render(){

  const el=document.getElementById("recoveryBanner");
  if(!el) return;

  if(state==="idle"){
    closeOverlay("recoveryBanner");
    return;
  }

  el.textContent=translate(`recovery.${state}`);
  showOverlay("recoveryBanner");


  if(state==="found"){
    el.onclick=()=>{
      setRecoveryState("sending");
      window.dispatchEvent(new Event("resumeQueue"));
    };
  }else{
    el.onclick=null;
  }
}