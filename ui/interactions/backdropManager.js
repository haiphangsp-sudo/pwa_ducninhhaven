// ui/interactions/backdropManager.js
export function syncOverlay(activeId) {
  const container = document.getElementById("overlay");
  const backdrop = document.getElementById("overlayBackdrop");
  if (!container) return;

  Array.from(container.children).forEach(el => {
    const isActive = el.id === activeId;

    el.classList.remove("animate-fade-in", "animate-fade-out");

    if (isActive) {
      el.classList.remove("hidden");
      el.classList.add("animate-fade-in");
    } else {
      el.classList.add("hidden");
    }
  });

  if (activeId && typeof activeId === "string") {
    backdrop?.classList.remove("hidden");
  } else {
    backdrop?.classList.add("hidden");
  }
}