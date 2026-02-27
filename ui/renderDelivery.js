// ui/renderDelivery.js
// Non-blocking delivery status banner

import { UI } from "../core/state.js";

export function renderDelivery(){

  const el = document.getElementById("deliveryStatus");
  if(!el) return;

  const state = UI.delivery.state;

  if(state === "idle"){
    el.classList.add("hidden");
    return;
  }

  el.classList.remove("hidden");

  if(state === "pending")
    el.innerText = "Đang gửi đến bếp…";

  if(state === "sending")
    el.innerText = "Đang thử lại…";

  if(state === "stalled")
    el.innerText = "Mạng yếu — sẽ tự gửi khi có mạng";
}