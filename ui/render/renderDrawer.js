// ui/render/renderDrawer.js
import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { closeOverlay } from "../interactions/overlayManager.js";

// Biến cờ cục bộ để theo dõi trạng thái thay đổi
let isModified = false;

export function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer || UI.cart.items === undefined) return;

    const items = UI.cart.items;
    const titleEl = drawer.querySelector(".drawer-title");
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const closeBtn = document.getElementById("drawerClose");

    // 1. Cập nhật Tiêu đề
    titleEl.textContent = translate("cart.title");

    // 2. Xử lý nút Đóng
    closeBtn.onclick = () => {
        isModified = false; // Reset trạng thái khi đóng
        closeOverlay();
    };

    // 3. Render danh sách món ăn vào #drawerItems
    if (items.length === 0) {
        isModified = false;
        itemsContainer.innerHTML = `<p class="empty-msg">${translate("cart.empty")}</p>`;
        sendBtn.classList.add("hidden"); // Ẩn nút gửi nếu giỏ trống
    } else {
        sendBtn.classList.remove("hidden");
        itemsContainer.innerHTML = items.map((item, index) => `
            <div class="drawer-item row items-center justify-between">
                <div class="stack">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price ? item.price.toLocaleString() : ''}</span>
                </div>
                <div class="row items-center gap-s">
                    <button class="qty-btn min" data-index="${index}">-</button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
            </div>
        `).join('');
    }

    // 4. Cập nhật nút Gửi/Xác nhận (#drawerSend)
    updateSendButton(sendBtn);

    // 5. Gán sự kiện
    attachEvents(itemsContainer, sendBtn);
}

function updateSendButton(btn) {
    if (isModified) {
        btn.textContent = translate("cart.confirm_changes");
        btn.className = "drawer-send state-confirm"; // Đổi class để đổi màu CSS
    } else {
        btn.textContent = translate("cart.send_order");
        btn.className = "drawer-send state-send";
    }
}

function attachEvents(container, sendBtn) {
    // Sự kiện tăng giảm số lượng
    container.querySelectorAll(".qty-btn").forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.dataset.index);
            const delta = btn.classList.contains("plus") ? 1 : -1;
            
            isModified = true; // Bật cờ chỉnh sửa
            updateCartQuantity(index, delta);
            // RenderDrawer sẽ tự chạy lại nhờ subscribe(renderApp) trong main.js
        };
    });

    // Sự kiện nút Gửi/Xác nhận
    sendBtn.onclick = () => {
        if (isModified) {
            isModified = false;
            renderDrawer(); // Vẽ lại để nút trở về chữ "GỬI"
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            sendCart();
            closeOverlay(); // Đóng giỏ sau khi gửi thành công
        }
    };
}