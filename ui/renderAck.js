import { UI, setState } from "../core/state.js";

let timer=null;

export function renderAck(){

  const el=document.getElementById("ackOverlay");
  if(!el) return;

  if(UI.ack.state==="hidden"){
    el.classList.add("hidden");
    return;
  }
  el.innerHTML = '<div class="ack-dot"></div>';
  el.classList.remove("hidden");
  
  clearTimeout(timer);
  timer=setTimeout(()=>{
    setState({ ack:{state:"hidden"} });
  },700);
}