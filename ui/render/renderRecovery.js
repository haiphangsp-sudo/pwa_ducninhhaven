// ui/renderRecovery.js
// Banner hiển thị khi phát hiện có yêu cầu chưa gửi (do mất mạng hoặc đóng app đột ngột)

import { translate } from "../utils/translate.js";


let state="idle";

export function setRecoveryState(s){
  state=s;
  render();
}

function render(){

  const el=document.getElementById("recoveryBanner");
  if(!el) return;

  if (state === "idle") {
    el.classList.add("hidden");
    return;
  }

  el.textContent = translate(`recovery.${state}`);
  el.classList.remove("hidden");

  if(state==="found"){
    el.onclick=()=>{
      setRecoveryState("sending");
      window.dispatchEvent(new Event("resumeQueue"));
    };
  }else{
    el.onclick=null;
  }
}