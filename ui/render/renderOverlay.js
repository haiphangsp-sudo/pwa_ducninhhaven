// ui/render/renderOverlay.js

export function renderAck({ visible, status, message }) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  // Reset class về mặc định mỗi lần render
  el.className = "overlay__ack"; 

  if (visible) {
    el.textContent = translate(message) || message; // Hỗ trợ cả key translate và string thô
    el.classList.add("show");
    if (status) el.classList.add(status);
  } else {
    el.classList.add("hidden");
  }
}