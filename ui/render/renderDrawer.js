// ui/render/renderDrawer.js
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { closeOverlay, showOverlay } from "../interactions/backdropManager.js"; 
import { MENU } from "../../core/menuStore.js";

let isModified = false;

// Biến lưu trạng thái gốc lúc vừa mở Giỏ hàng
let initialCartSnapshot = ""; 

export function openCartDrawer() {
    // CHỤP ẢNH: Lưu lại trạng thái giỏ hàng ngay lúc khách bấm "Xem giỏ"
    initialCartSnapshot = JSON.stringify(UI.cart.items);
    
    renderDrawer();
    showOverlay("cartDrawer");
}

export function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    const items = UI.cart.items || [];
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const totalEl = drawer.querySelector(".drawer-total");

    // SO SÁNH THÔNG MINH:
    // Nếu dữ liệu hiện tại khác với lúc vừa mở -> isModified = true
    const currentCartState = JSON.stringify(items);
    const isModified = currentCartState !== initialCartSnapshot;

    // 1. Tính tổng tiền
    let total = 0;
    items.forEach(it => {
        const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
        total += (price * it.qty);
    });
    
    if (totalEl) {
        totalEl.textContent = total > 0 ? total.toLocaleString("vi-VN") + "đ" : "";
    }

    // 2. Render danh mục món ăn (giữ nguyên logic cũ của bạn)
    if (items.length === 0) {
        itemsContainer.innerHTML = `<div class="p-m center">${translate("cart_bar.empty")}</div>`;
        if (sendBtn) sendBtn.classList.add("hidden");
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

    // 3. Cập nhật nút bấm: Nếu quay về như cũ, nút sẽ tự động chuyển về màu Xanh (Gửi)
    if (sendBtn) {
        sendBtn.textContent = isModified ? translate("cart_bar.confirm_changes") : translate("cart_bar.send_order");
        sendBtn.className = `drawer-send ${isModified ? 'state-confirm' : 'state-send'}`;
    }
}

// Hàm attachDrawerEvents giữ nguyên như bản trước (nhớ xóa biến isModified bên trong nó)

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
      const currentItems = UI.cart.items;
      const currentCartState = JSON.stringify(currentItems);
      isModified = currentCartState !== initialCartSnapshot;

      if (isModified) {
          // Cập nhật lại "ảnh chụp gốc" bằng dữ liệu mới đã xác nhận
          initialCartSnapshot = currentCartState;
          renderDrawer(); // Vẽ lại để nút trở về Xanh
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