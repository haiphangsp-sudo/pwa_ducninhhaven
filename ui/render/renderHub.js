
// ui/render/renderDrawer.js
import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { showOverlay, closeOverlay } from "../interactions/overlayManager.js";

let isModified = false;
let eventsAttached = false; // Cờ đảm bảo addEventListener chỉ chạy 1 lần

/**
 * Hàm mở giỏ hàng từ nút "Xem giỏ"
 */
export function openCartDrawer() {
    renderDrawer(); // Cập nhật dữ liệu vào HTML
    showOverlay("cartDrawer"); // Mở giao diện
}

/**
 * Hàm Render nội bộ - Bơm dữ liệu vào HTML có sẵn
 */
function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    const items = UI.cart.items || [];
    
    // 1. Cập nhật Tiêu đề và Tổng cộng
    drawer.querySelector(".drawer-title").textContent = translate("cart.title");
    
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    drawer.querySelector(".drawer-total").textContent = total > 0 ? total.toLocaleString() + "đ" : "";

    // 2. Bơm danh sách món vào #drawerItems
    const itemsContainer = document.getElementById("drawerItems");
    if (items.length === 0) {
        itemsContainer.innerHTML = `<div class="p-m center text-muted">${translate("cart.empty")}</div>`;
        isModified = false;
    } else {
        itemsContainer.innerHTML = items.map((item, index) => `
            <div class="drawer-item row items-center justify-between p-s border-b">
                <div class="stack">
                    <span class="weight-600">${item.name}</span>
                    <span class="text-s text-muted">${item.price ? item.price.toLocaleString() : ''}</span>
                </div>
                <div class="row items-center gap-s">
                    <button class="qty-btn min" data-index="${index}">-</button>
                    <span class="qty-val weight-600">${item.qty}</span>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
            </div>
        `).join('');
    }

    // 3. Cập nhật nút Gửi/Xác nhận (#drawerSend)
    const sendBtn = document.getElementById("drawerSend");
    if (items.length === 0) {
        sendBtn.classList.add("hidden");
    } else {
        sendBtn.classList.remove("hidden");
        sendBtn.textContent = isModified ? translate("cart.confirm_changes") : translate("cart.send_order");
        // Gán class để CSS đổi màu
        sendBtn.className = `drawer-send ${isModified ? 'state-confirm' : 'state-send'}`;
    }

    // 4. CHỈ GÁN SỰ KIỆN 1 LẦN DUY NHẤT
    if (!eventsAttached) {
        attachDrawerEvents(drawer);
        eventsAttached = true;
    }
}


export function attachDrawerEvents(drawer) {
    // A. Sự kiện đóng (nút X)
    document.getElementById("drawerClose").addEventListener("click", () => {
        isModified = false; // Reset trạng thái chỉnh sửa khi đóng
        closeOverlay();
    });

    // B. Sự kiện cho nút Gửi/Xác nhận (Event Delegation không cần thiết ở đây vì ID cố định)
    document.getElementById("drawerSend").addEventListener("click", () => {
        if (isModified) {
            isModified = false; 
            renderDrawer(); // Vẽ lại để nút quay về màu xanh "Gửi"
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            sendCart();
            closeOverlay();
        }
    });

    // C. EVENT DELEGATION cho các nút cộng trừ (+) (-)
    // Gán vào #drawerItems, bất kể bên trong render bao nhiêu lần thì event vẫn chạy đúng
    document.getElementById("drawerItems").addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        const delta = btn.classList.contains("plus") ? 1 : -1;

        isModified = true; // Chuyển sang chế độ "Cần xác nhận"
        updateCartQuantity(index, delta); 
        // Note: updateCartQuantity gọi setState -> renderApp -> gọi lại renderDrawer() tự động
    });
}