// ui/interactions/overlayManager.js


let current = null;
const backdrop = document.getElementById("overlayBackdrop");

export function showOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;

    closeOverlay();
    el.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    current = el;
    backdrop.onclick = closeOverlay;
}

export function closeOverlay() {
    if (!current) return;
    current.classList.add("hidden");
    backdrop.classList.add("hidden");
    current = null;
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeOverlay();
});

//