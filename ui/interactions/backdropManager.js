// ui/interactions/overlayManager.js


let current = false;
let el = null;
const backdrop = document.getElementById("overlayBackdrop");

export function showOverlay(id) {
    if (!current) {
        el = document.getElementById(id).classList.remove("hidden");
        el.style.opacity = 0;
            
        setTimeout(() => {
            el.style.opacity = 1;
        }, 10);
        backdrop.classList.remove("hidden");
        backdrop.onclick = closeOverlay;
        current = true;
    }
}

export function closeOverlay() {
    if (current) { 
        el.classList.add("hidden");
        backdrop.classList.add("hidden");
        current = false;
    }   
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeOverlay();
});
