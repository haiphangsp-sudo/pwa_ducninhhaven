

export function renderAck(state) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  const ack = state.ack;
  // Sửa từ ack?.visible thành ack?.state === "show"
  if (ack?.state !== "show") { 
    el.classList.add("hidden");
    el.textContent = "";
    return;
  }

  el.textContent = ack.message || "";
  el.className = `overlay__ack ${ack.status || ""}`;
  el.classList.remove("hidden");
}