// ui/render/renderDrawer.js
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { closeOverlay } from "../interactions/backdropManager.js"; 
import { MENU } from "../../core/menuStore.js";

let isModified = false;
let eventsAttached = false; // Cờ để nhốt sự kiện

export function openCartDrawer() {
    isModified = false;
    renderDrawer();
    
}

export function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    // QUAN TRỌNG: Không chặn render bằng class 'hidden' 
    // để dữ liệu cập nhật ngay cả khi drawer đang trong quá trình mở/đóng

    const items = UI.cart.items || [];
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const totalEl = drawer.querySelector(".drawer-total");

    // 1. Cập nhật Tiêu đề
    drawer.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

    // 2. TÍNH TỔNG TIỀN (Sửa lỗi: Phải lấy giá từ MENU store)
    let total = 0;
    items.forEach(item => {
        const price = MENU?.[item.category]?.items?.[item.item]?.options?.[item.option]?.price || 0;
        total += price * item.qty;
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
            const menuOption = menuItem?.options?.[item.option];
            const price = menuOption?.price || 0;
            
            // Lấy nhãn đa ngôn ngữ
            const itemLabel = translate(menuItem?.label || item.item);
            const optionLabel = menuOption?.label ? translate(menuOption.label) : "";

            return `
                <div class="drawer__item drawer-item">
                    <div class="drawer__info">
                        <strong>${itemLabel}</strong>
                        <span class="drawer__variant">${optionLabel}</span>
                        <span class="text-s text-muted">${price.toLocaleString("vi-VN")} đ</span>
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

    // 4. Cập nhật nút Gửi/Xác nhận
    if (sendBtn) {
        sendBtn.textContent = isModified ? translate("cart_bar.confirm_changes") : translate("cart_bar.send_order");
        sendBtn.className = `drawer-send ${isModified ? 'state-confirm' : 'state-send'}`;
    }

    // 5. Chỉ gán event 1 lần
    if (!eventsAttached) {
        attachDrawerEvents();
        eventsAttached = true;
    }
}

export function attachDrawerEvents() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    // Event Delegation cho nút +/- (QUAN TRỌNG NHẤT)
    const itemsContainer = document.getElementById("drawerItems");
    itemsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        const delta = btn.classList.contains("plus") ? 1 : -1;

        isModified = true; // Chuyển sang chế độ "Xác nhận"
        updateCartQuantity(index, delta); 
        // Sau khi updateCartQuantity gọi setState, renderApp sẽ tự chạy và gọi renderDrawer().
    });

    // Nút Gửi/Xác nhận
    document.getElementById("drawerSend").addEventListener("click", () => {
        if (isModified) {
            isModified = false;
            renderDrawer(); // Vẽ lại để nút quay về màu xanh
        } else {
            sendCart();
            closeOverlay();
        }
    });

    // Nút đóng
    document.getElementById("drawerClose").addEventListener("click", () => {
        isModified = false;
        closeOverlay();
    });
}