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
  if (!drawer || drawer.classList.contains("hidden")) return;

  const items = UI.cart.items || [];
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const totalEl = drawer.querySelector(".drawer-total");

  // 1. Cập nhật Tiêu đề
  drawer.querySelector(".drawer-title").textContent = translate("cart_bar.cart_title");

  // 2. Tính tổng tiền (Phải lấy từ MENU store để tránh lỗi NaN)
  let total = 0;
  items.forEach(it => {
    const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
    total += (price * it.qty);
  });
  
  if (totalEl) {
    totalEl.textContent = total > 0 ? total.toLocaleString("vi-VN") + "đ" : "";
  }

  // 3. Render danh sách món ăn
  if (items.length === 0) {
    itemsContainer.innerHTML = `<div class="p-m center text-muted">${translate("cart_bar.empty")}</div>`;
    sendBtn.style.display = "none";
    isModified = false;
  } else {
    sendBtn.style.display = "block";
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
            <span class="qty qty-val weight-600">${item.qty}</span>
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

  // 5. "Nhốt" sự kiện chỉ 1 lần duy nhất
  if (!eventsAttached) {
    attachDrawerEvents();
    eventsAttached = true;
  }
}

export function attachDrawerEvents() {
  // Sự kiện nút Gửi / Xác nhận
  document.getElementById("drawerSend").addEventListener("click", () => {
    if (isModified) {
      isModified = false;
      renderDrawer(); // Quay lại trạng thái xanh (Sẵn sàng gửi)
    } else {
      sendCart();
      closeOverlay();
    }
  });

  // Event Delegation cho nút +/- (Giúp số lượng nhảy ngay lập tức)
  document.getElementById("drawerItems").addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;

    const index = parseInt(btn.dataset.index);
    const delta = btn.classList.contains("plus") ? 1 : -1;

    isModified = true; // Bật cờ chỉnh sửa
    updateCartQuantity(index, delta);
  });

  // Nút đóng (X)
  document.getElementById("drawerClose").onclick = () => {
    isModified = false;
    closeOverlay();
  };
}