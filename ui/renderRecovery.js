// ui/renderRecovery.js
// Hiển thị khi app mở lại mà còn request chưa hoàn tất

import { loadQueue, saveQueue } from "../core/queue.js";
import { setState } from "../core/state.js";

let decided = false;

export function renderRecovery(){

  if(decided) return;

  const queue = loadQueue();
  if(!queue.length) return;

  const el = document.getElementById("recoveryBanner");
  if(!el) return;

  el.classList.remove("hidden");

  document.getElementById("recoverySend").onclick = ()=>{
    decided = true;
    el.classList.add("hidden");
    setState({ delivery:{state:"pending"} });
    window.dispatchEvent(new Event("resumeQueue"));
  };

  document.getElementById("recoveryCancel").onclick = ()=>{
    decided = true;
    saveQueue([]);
    el.classList.add("hidden");
    setState({ delivery:{state:"idle"} });
  };
}