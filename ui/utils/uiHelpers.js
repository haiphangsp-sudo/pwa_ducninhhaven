// ui/utils/uiHelpers.js

export function showToast(message, type = "success") {
    // 1. Tạo container nếu chưa có
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    // 2. Tạo toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    const icon = type === "success" ? "✓" : "✕";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    // 3. Tự động xóa sau 3 giây
    setTimeout(() => {
        toast.classList.add("fade-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
            if (container.children.length === 0) container.remove();
        });
    }, 3000);
}