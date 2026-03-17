//  renderAck.js
// ---------- ACKNOWLEDGEMENT RENDER ----------

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { showOverlay, closeOverlay } from "../interactions/overlayManager.js";


let timer=null;

export function renderAck(){

  const el=document.getElementById("ackOverlay");
  if(!el) return;

  if(UI.ack.state==="hidden"){
    closeOverlay("ackOverlay");
    return;
  }
  el.innerHTML = `<div class="loader ack-dot">${translate("delivery.ack_success")}</div>`;
  showOverlay("ackOverlay");
  
  clearTimeout(timer);
  timer=setTimeout(()=>{
    setState({ ack:{state:"hidden"} });
  },1400);
}