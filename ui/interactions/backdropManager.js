// ui/interactions/backdropManager.js

let currentOverlay = null;
const backdrop = document.getElementById("overlayBackdrop");

export function showOverlay(id) {
    // 1. Nếu đang có cái khác mở, đóng nó trước
    if (currentOverlay) {
        // Không truyền tham số vì hàm closeOverlay() của bạn không nhận tham số
        closeOverlay(); 
    }

    const el = document.getElementById(id);
    if (!el) return;

    // 2. Hiển thị backdrop
    if (backdrop) {
        backdrop.classList.remove("hidden");
    }

    // 3. Hiển thị Overlay mới
    el.classList.remove("hidden");
    el.style.opacity = "0";
    el.offsetHeight; // Force reflow
    
    setTimeout(() => {
        el.style.opacity = "1";
    }, 10);

    currentOverlay = el;
}

export function closeOverlay() {
    if (!currentOverlay) return;

    // 4. Ẩn overlay hiện tại
    currentOverlay.style.opacity = "0";
    currentOverlay.classList.add("hidden");
    
    // 5. Ẩn backdrop nếu không còn overlay nào khác (Logic an toàn)
    if (backdrop) {
        backdrop.classList.add("hidden");
    }

    currentOverlay = null;
}