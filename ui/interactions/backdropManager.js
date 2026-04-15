// ui/interactions/backdropManager.js
export function syncOverlay(activeId) {
  const container = document.getElementById("overlay");
  const backdrop = document.getElementById("overlayBackdrop");
  if (!container) return;

  // CẬP NHẬT: Nếu activeId là null, ẩn luôn cả container cha
  if (!activeId) {
    container.classList.add("hidden");
  } else {
    container.classList.remove("hidden");
  }

  Array.from(container.children).forEach(el => {
    if (el.id === "overlayBackdrop") return; 
    const isActive = el.id === activeId;
    el.classList.toggle("hidden", !isActive);
  });

  // Xử lý backdrop xám
  if (activeId && typeof activeId === "string") {
    backdrop?.classList.remove("hidden");
  } else {
    backdrop?.classList.add("hidden");
  }
}