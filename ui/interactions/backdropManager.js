// ui/interactions/backdropManager.js

let currentOverlay = null;
const backdrop = document.getElementById("overlayBackdrop");

/**
 * Hiển thị một Overlay cụ thể
 * @param {string} id - ID của element trong index.html
 */
export function showOverlay(id) {
    let newOverlay = null;
    // Nếu đang có một cái mở rồi thì
    if (currentOverlay) {
        closeOverlay(currentOverlay);
    }
    newOverlay = document.getElementById(id);
    if (!newOverlay) {
        console.warn(`Overlay với ID "${id}" không tồn tại.`);
        return;
    }
    
    // Hiển thị backdrop
    if (backdrop) {
        backdrop.classList.remove("hidden");
        backdrop.onclick = closeOverlay;
    }

    // Hiển thị Overlay với hiệu ứng mượt
    newOverlay.classList.remove("hidden");
    newOverlay.style.opacity = "0";
    
    // Force reflow để trình duyệt nhận diện trạng thái opacity = 0 trước khi transition
    newOverlay.offsetHeight; 
    
    setTimeout(() => {
        newOverlay.style.opacity = "1";
    }, 10);

    currentOverlay = id;
}

/**
 * Đóng Overlay đang mở
 */
export function closeOverlay() {
    if (!currentOverlay) return;

    // Hiệu ứng mờ dần trước khi ẩn hoàn toàn
    currentOverlay.style.opacity = "0";
    
    // Đợi hiệu ứng CSS hoàn tất (thường là 300ms) rồi mới thêm class hidden
    setTimeout(() => {
        if (currentOverlay) {
            currentOverlay.classList.add("hidden");
            currentOverlay = null;
        }
        if (backdrop) {
            backdrop.classList.add("hidden");
        }
    }, 300); // Bạn nên khớp con số này với transition trong CSS
}

export function attachBackdropEvents() {
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeOverlay();
    });
}