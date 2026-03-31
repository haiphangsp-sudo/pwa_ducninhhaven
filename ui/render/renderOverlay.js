// ui/render/renderAckOverlay.js

import { setState } from "../../core/state.js";


export function renderAckOverlay(state) {
    const overlay = document.getElementById("ackOverlay");
    if (!overlay) return;

        // 1. Hiện overlay bằng cách bỏ class hidden
        overlay.classList.remove("hidden");
        
        // 2. Cập nhật icon/màu sắc dựa trên status (success/error)
        const iconEl = overlay.querySelector(".ack-icon");
        if (iconEl) {
            iconEl.textContent = state.ack.status === "success" ? "✓" : "✕";
            iconEl.style.color = state.ack.status === "success" ? "var(--success)" : "var(--error)";
        }

        // 3. Tự động tắt sau 2.5 giây (nếu bạn muốn)
        setTimeout(() => {
            setState({ ack: { visible: false, status: null, message: "", at: null } });
            overlay.classList.add("hidden");
        }, 2500);
        
    
}
