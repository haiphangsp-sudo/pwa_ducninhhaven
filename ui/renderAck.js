// ui/renderAck.js
// Blocking acknowledgement (hiển thị rất ngắn)

import { UI, setState } from "../core/state.js";

let timer = null;

export function renderAck(){

  const el = document.getElementById("ackOverlay");
  if(!el) return;

  if(UI.ack.state === "hidden"){
    el.classList.add("hidden");
    return;
  }

  el.classList.remove("hidden");
  el.innerText = "Đã ghi nhận yêu cầu";

  if(timer) clearTimeout(timer);

  timer = setTimeout(()=>{
    setState({
      ack:{ state:"hidden" }
    });
  },1500);
}