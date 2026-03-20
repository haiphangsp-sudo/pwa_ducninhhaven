// ui/render/renderDrawer.js
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { closeOverlay } from "../interactions/backdropManager.js"; 
import { MENU } from "../../core/menuStore.js";

let isModified = false;

export function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    const items = UI.cart.items || [];
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const totalEl = drawer.querySelector(".drawer-total");

    // 1. Cập nhật Tiêu đề
    drawer.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

    // 2. Tính tổng tiền (Lấy giá chuẩn từ MENU Store)
    let total = 0;
    items.forEach(it => {
        const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
        total += (price * it.qty);
    });
    
    if (totalEl) {
        totalEl.textContent = total > 0 ? total.toLocaleString("vi-VN") + "đ" : "";
    }

    // 3. Bơm danh sách món ăn vào HTML
    if (items.length === 0) {
        itemsContainer.innerHTML = `<div class="p-m center text-muted">${translate("cart_bar.empty")}</div>`;
        if (sendBtn) sendBtn.classList.add("hidden");
        isModified = false; 
    } else {
        if (sendBtn) sendBtn.classList.remove("hidden");
        itemsContainer.innerHTML = items.map((item, index) => {
            const menuItem = MENU?.[item.category]?.items?.[item.item];
            const option = menuItem?.options?.[item.option];
            const price = option?.price || 0;
            
            return `
                <div class="drawer__item drawer-item row items-center justify-between">
                    <div class="drawer__info stack">
                        <strong class="weight-600">${translate(menuItem?.label || item.item)}</strong>
                        <span class="text-s text-muted">${option?.label ? translate(option.label) : ""}</span>
                        <span class="text-s">${price.toLocaleString()}đ</span>
                    </div>
                    <div class="drawer-qty">
                        <button class="qty-minus center" data-index="${index}" type="button">-</button>
                        <span class="qty">${item.qty}</span>
                        <button class="qty-plus center" data-index="${index}" type="button">+</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Cập nhật nút Gửi/Xác nhận
    if (sendBtn) {
        sendBtn.textContent = isModified ? translate("cart_bar.confirm_changes") : translate("cart_bar.send_order");
        sendBtn.className = `drawer-send ${isModified ? 'state-confirm' : 'state-send'}`;
    }
}

export function attachDrawerEvents() {
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const closeBtn = document.getElementById("drawerClose");

    // Click +/- (Event Delegation)
    itemsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        const delta = btn.classList.contains("plus") ? 1 : -1;

        isModified = true; // Chuyển sang nút Vàng "Xác nhận"
        updateCartQuantity(index, delta);
    });

    // Click Gửi/Xác nhận
    sendBtn.addEventListener("click", () => {
        if (isModified) {
            isModified = false;
            renderDrawer(); // Vẽ lại để nút quay về Xanh
        } else {
            sendCart();
            closeOverlay();
        }
    });

    // Click đóng
    closeBtn.addEventListener("click", () => {
        isModified = false;
        closeOverlay();
    });
}