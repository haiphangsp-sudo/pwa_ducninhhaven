
// ui/render/renderDrawer.js
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";
import { showOverlay, closeOverlay } from "../interactions/backdropManager.js"; 
import { MENU } from "../../core/menuStore.js";

let isModified = false;

/**
 * Hàm mở giỏ hàng
 */
export function openCartDrawer() {
    isModified = false; // Reset trạng thái khi mới mở
    renderDrawer(); 
    showOverlay("cartDrawer");
}

/**
 * Hàm Render chính - Tự động đồng bộ dữ liệu từ State vào HTML
 */
export function renderDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    const items = UI.cart.items || [];
    const itemsContainer = document.getElementById("drawerItems");
    const sendBtn = document.getElementById("drawerSend");
    const totalEl = drawer.querySelector(".drawer-total");

    // 1. Cập nhật Tiêu đề
    drawer.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

    // 2. Tính tổng tiền - SỬA LỖI: Truy xuất giá từ MENU dựa trên category/item/option
    const total = items.reduce((sum, item) => {
        const price = MENU?.[item.category]?.items?.[item.item]?.options?.[item.option]?.price || 0;
        return sum + (price * item.qty);
    }, 0);
    
    if (totalEl) {
        totalEl.textContent = total > 0 ? total.toLocaleString("vi-VN") + "đ" : "";
    }

    // 3. Render danh sách món (Hỗ trợ đa ngôn ngữ cho tên món và tùy chọn)
    if (items.length === 0) {
        itemsContainer.innerHTML = `<div class="p-m center text-muted">${translate("cart_bar.empty")}</div>`;
        sendBtn.classList.add("hidden");
        isModified = false;
    } else {
        sendBtn.classList.remove("hidden");
        itemsContainer.innerHTML = items.map((item, index) => {
            const menuItem = MENU?.[item.category]?.items?.[item.item];
            const menuOption = menuItem?.options?.[item.option];
            const price = menuOption?.price || 0;
            
            // Lấy nhãn đã được dịch từ i18n
            const itemLabel = translate(menuItem?.label || item.item);
            const optionLabel = menuOption?.label ? translate(menuOption.label) : "";

            return `
                <div class="drawer__item drawer-item">
                    <div class="drawer__info">
                        <strong>${itemLabel}</strong>
                        <span class="drawer__variant">${optionLabel}</span>
                        <span class="text-s text-muted">${price > 0 
                            ? price.toLocaleString("vi-VN") + " đ" 
                            : price === 0 ? translate("cart_bar.free") : translate("cart_bar.instant")
                        }</span>
                    </div>
                    <div class="drawer-qty items-center gap-s">
                        <button class="qty-btn min" data-index="${index}">-</button>
                        <span class="qty qty-val">${item.qty}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 4. Cập nhật trạng thái nút Gửi/Xác nhận
    if (sendBtn && items.length > 0) {
        sendBtn.textContent = isModified ? translate("cart_bar.confirm_changes") : translate("cart_bar.send_order");
        sendBtn.className = `drawer-send ${isModified ? 'state-confirm' : 'state-send'}`;
    }
}

/**
 * Gán sự kiện - Nhốt toàn bộ vào attachDrawerEvents() và chỉ gọi 1 lần
 */
export function attachDrawerEvents() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    // A. Sự kiện đóng
    document.getElementById("drawerClose").addEventListener("click", () => {
        isModified = false;
        closeOverlay();
    });

    // B. Sự kiện cho nút Gửi / Xác nhận
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

    // C. KỸ THUẬT EVENT DELEGATION: Nhốt tất cả click +/- vào Container cha
    document.getElementById("drawerItems").addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;

        const index = parseInt(btn.dataset.index);
        const delta = btn.classList.contains("plus") ? 1 : -1;

        isModified = true; // Bật trạng thái "Cần xác nhận"
        updateCartQuantity(index, delta); 
        // Khi updateCartQuantity gọi setState -> renderApp -> renderDrawer sẽ tự động cập nhật Qty ngay lập tức
    });
}