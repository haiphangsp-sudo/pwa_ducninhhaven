//  renderAck.js
// ---------- ACKNOWLEDGEMENT RENDER ----------

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";


let timer=null;

export function renderAck(){

  const el=document.getElementById("ackOverlay");
  if(!el) return;

  if (UI.ack.state === "hidden") {
    el.classList.add("hidden");
    clearTimeout(timer);
    return;
  }
  el.innerHTML = `
  <div class="loader loader-l"></div>
  <div class="ack-text">${translate("delivery.ack_success")}</div>
`;
  el.classList.remove("hidden");
  clearTimeout(timer);
  
  timer=setTimeout(()=>{
    setState({ ack:{state:"hidden"} });
  },1400);
}