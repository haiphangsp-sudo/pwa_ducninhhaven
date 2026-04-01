// ui/render/renderOverlay.js

import { translate } from "../utils/translate.js";

export function renderAck(state) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  const ack = state.ack;
  if (!ack?.visible) {
    el.classList.add("hidden");
    el.classList.remove("show");
    el.textContent = "";
    return;
  }

  el.textContent = translate(ack.message || "" );
  el.className = `overlay__ack ${ack.status || ""}`;
  el.classList.remove("hidden");
  el.classList.add("show");
}