// ui/render/renderAckOverlay.js

export function renderAckOverlay(ackState) {
    const overlay = document.getElementById("ackOverlay");
    if (!overlay) return;

    if (ackState.state === "show") {
        // 1. Hiện overlay bằng cách bỏ class hidden
        overlay.classList.remove("hidden");
        
        // 2. Cập nhật icon/màu sắc dựa trên status (success/error)
        const iconEl = overlay.querySelector(".ack-icon");
        if (iconEl) {
            iconEl.textContent = ackState.status === "success" ? "✓" : "✕";
            iconEl.style.color = ackState.status === "success" ? "var(--success)" : "var(--error)";
        }

        // 3. Tự động tắt sau 2.5 giây (nếu bạn muốn)
        setTimeout(() => {
            setState({ ack: { state: "hide", status: "" } });
        }, 2500);
        
    } else {
        // Ẩn overlay
        overlay.classList.add("hidden");
    }
}