import { UI, setState } from "../core/state.js";
import { t } from "../data/i18n.js";

let timer=null;

export function renderAck(){

  const el=document.getElementById("ackOverlay");
  if(!el) return;

  if(UI.ack.state==="hidden"){
    el.classList.add("hidden");
    return;
  }

  el.classList.remove("hidden");
  el.innerText=t("ack"); // chỉ xác nhận thao tác

  clearTimeout(timer);
  timer=setTimeout(()=>{
    setState({ ack:{state:"hidden"} });
  },700);
}