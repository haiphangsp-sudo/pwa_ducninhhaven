// ui/interactions/backdropManager.js

export function syncOverlay(activeId) {
  const container = document.getElementById("overlay");
  const backdrop = document.getElementById("overlayBackdrop");
  if (!container) return;

  // 1. Duyệt qua tất cả các con của container #overlay
  Array.from(container.children).forEach(el => {

    // So khớp ID của element với activeId từ State
    if (el.id === activeId) {
      el.classList.remove("animate-fade-out");
      el.classList.add("animate-fade-in");
    } else {
      el.classList.add("animate-fade-out");
      el.classList.remove("animate-fade-in");
    }
  });

  // 2. Điều khiển Backdrop dựa trên việc có cái nào đang mở hay không
  if (activeId && typeof activeId === 'string') {
    backdrop?.classList.remove("hidden");
  } else {
      backdrop?.classList.add("hidden");
  }
}
