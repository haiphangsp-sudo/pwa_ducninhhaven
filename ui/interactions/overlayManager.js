// ui/interactions/overlayManager.js


let current = false;
const backdrop = document.getElementById("overlayBackdrop");

export function showOverlay(id) {
    if (!current) {
        const el = document.getElementById(id);
        el.classList.remove("hidden");
        backdrop.classList.remove("hidden");
        backdrop.onclick = closeOverlay;
        current = true;
    }
}

export function closeOverlay() {
    if (current) { 
        current.classList.add("hidden");
        backdrop.classList.add("hidden");
        current = false;
    }   
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeOverlay();
});
