// ui/render/renderOverlay.js

import { translate } from "../utils/translate.js";


export function renderAck({ visible, status, message }) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  // Reset class về mặc định mỗi lần render
  el.className = "overlay__ack"; 

  if (visible) {
    el.textContent = message; // Hỗ trợ cả key translate và string thô
    el.classList.add("show");
    el.classList.remove("hidden");

    if (status) el.classList.add(status);
  } else {
    el.classList.remove("show");
    el.classList.add("hidden");
  }
}