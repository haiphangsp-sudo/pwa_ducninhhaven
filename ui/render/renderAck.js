
// ui/render/renderAck.js

import { translate } from "../utils/translate.js";


/* =========================
   PUBLIC
========================= */


export function renderAck(state) {
  const container = document.getElementById("ackContainer");
  const box = document.getElementById("ackOverlay");
  
  if (!container || !box) return;

  const ack = state.ack;

  // Nếu trạng thái không phải là "show", ẩn toàn bộ container
  if (ack?.state !== "show") {
    container.classList.add("hidden");
    return;
  }

  // 1. Cập nhật nội dung văn bản
  box.textContent = ack.message || "";

  // 2. Cập nhật màu sắc dựa trên status (success, error, sending)
  box.className = `overlay__ack ${ack.status || ""}`;

  // 3. Hiển thị container (Vùng màu xám sẽ phủ full màn hình)
  container.classList.remove("hidden");
}