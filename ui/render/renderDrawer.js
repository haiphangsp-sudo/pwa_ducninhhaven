// ui/render/renderDrawer.js
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { closeOverlay } from "../interactions/backdropManager.js"; 
import { MENU } from "../../core/menuStore.js";

let isModified = false;
let eventsAttached = false;

export function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    // Chỉ thực hiện vẽ nếu Drawer đang mở để tiết kiệm hiệu năng
    if (drawer.classList.contains("hidden")) return;

    const items = UI.cart.items || [];
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const totalEl = drawer.querySelector(".drawer-total");

    // 1. Cập nhật Tiêu đề
    drawer.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

    // 2. Tính tổng tiền (An toàn & Chính xác)
    let total = 0;
    items.forEach(it => {
        const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
        total += (price * it.qty);
    });
    
    if (totalEl) {
        totalEl.textContent = total > 0 ? total.toLocaleString("vi-VN") + "đ" : "";
    }

    // 3. Render danh sách món
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
                <div class="drawer__item drawer-item">
                    <div class="drawer__info">
                        <strong>${translate(menuItem?.label || item.item)}</strong>
                        <span class="drawer__variant">${option?.label ? translate(option.label) : ""}</span>
                        <span class="text-s text-muted">${price.toLocaleString()}đ</span>
                    </div>
                    <div class="drawer-qty row items-center gap-s">
                        <button class="qty-btn min" data-index="${index}">-</button>
                        <span class="qty-val weight-600">${item.qty}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Cập nhật nút Gửi
    if (sendBtn) {
        sendBtn.textContent = isModified ? translate("cart_bar.confirm_changes") : translate("cart_bar.send_order");
        sendBtn.className = `drawer-send ${isModified ? 'state-confirm' : 'state-send'}`;
    }

    // 5. Gán sự kiện (Chỉ gán 1 lần duy nhất)
    if (!eventsAttached) {
        attachDrawerEvents();
        eventsAttached = true;
    }
}

export function attachDrawerEvents() {
    const drawer = document.getElementById("cartDrawer");
    
    // Đóng drawer
    document.getElementById("drawerClose").onclick = () => {
        isModified = false;
        closeOverlay();
    };

    // Gửi hoặc Xác nhận
    document.getElementById("drawerSend").onclick = () => {
        if (isModified) {
            isModified = false;
            renderDrawer(); // Vẽ lại để chuyển màu nút về Xanh
        } else {
            sendCart();
            closeOverlay();
        }
    };

    // Ủy quyền sự kiện +/- cho container món ăn
    document.getElementById("drawerItems").onclick = (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        const delta = btn.classList.contains("plus") ? 1 : -1;

        isModified = true; // Bật cờ chỉnh sửa để hiện nút vàng
        updateCartQuantity(index, delta); 
    };
}