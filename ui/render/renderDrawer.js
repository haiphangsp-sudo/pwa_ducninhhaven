// ui/render/renderDrawer.js
import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart, ensureActive } from "../../core/events.js";
import { closeOverlay, showOverlay } from "../interactions/backdropManager.js"; 
import { MENU } from "../../core/menuStore.js";
import { getCartTotals, textItemItems } from "../utils/cartCalculators.js";
import { updateCartBarTotal } from "./renderCart.js";
import { openPicker } from "../components/placePicker";

// Chúng ta chỉ cần lưu "Ảnh chụp lúc mở" để so sánh
let initialCartSnapshot = ""; 

export function openCartDrawer() {
    // 1. Chụp ảnh giỏ hàng ngay lúc khách vừa bấm mở
    initialCartSnapshot = JSON.stringify(UI.cart.items);
    
    renderDrawer();
    showOverlay("cartDrawer");
}

export function renderDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  const items = UI.cart.items || [];
  const { totalQuantity, totalPrice, totalUnique, isEmpty } = getCartTotals(UI.cart.items);
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  drawer.querySelector(".drawer__header-title").textContent = translate("cart_bar.cart_title");
  drawer.querySelector(".drawer__header-price").textContent = totalPrice > 0 ? totalPrice.toLocaleString("vi-VN") + "đ" : "";
  drawer.querySelector(".drawer__header-count").textContent = textItemItems();
  drawer.querySelector(".drawer__header-unique").textContent = totalUnique + " " + translate("cart_bar.unique");
    // 2. TÍNH TOÁN THÔNG MINH (Derived State)
    // So sánh giỏ hàng hiện tại với ảnh chụp lúc mở
  const currentSnapshot = JSON.stringify(items);
  const hasChanged = currentSnapshot !== initialCartSnapshot;
  
    // 4. Render danh sách món
  if (isEmpty) {
    itemsContainer.innerHTML = `<div class="p-m center text-muted">${translate("cart_bar.empty")}</div>`;
    if (sendBtn) sendBtn.classList.add("hidden");
  } else {
    if (sendBtn) sendBtn.classList.remove("hidden");
    itemsContainer.innerHTML = items.map((item, index) => {
      const menuItem = MENU?.[item.category]?.items?.[item.item];
      const option = menuItem?.options?.[item.option];
      const price = option?.price;

      return `
        <div class="drawer__item drawer-item">
          <div class="drawer__info">
            <strong>${translate(menuItem?.label || item.item)}</strong>
            <span class="drawer__variant">${option?.label ? translate(option.label) : ""}</span>
            <span class="text-s text-muted">
              ${option.price > 0
                ? price.toLocaleString("vi-VN") + " đ"
                : price === 0 ? translate("cart_bar.free")
                : translate("cart_bar.instant")
              }
            </span>
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

  // 5. Cập nhật nút bấm dựa trên kết quả so sánh (hasChanged)
  if (sendBtn) {
      // Nếu có thay đổi so với ban đầu -> Hiện "XÁC NHẬN" (Vàng)
      // Nếu quay về như cũ -> Hiện "GỬI" (Xanh)
    sendBtn.textContent = hasChanged ? translate("cart_bar.confirm_changes") : translate("cart_bar.send_order");
    sendBtn.className = `drawer-send ${hasChanged ? 'state-confirm' : 'state-send'}`;
      
      // Lưu trạng thái vào dataset để hàm click biết cần làm gì
    sendBtn.dataset.modified = hasChanged;
  }
}

export function attachDrawerEvents() {
    const sendBtn = document.getElementById("drawerSend");

    // Click +/-
    document.getElementById("drawerItems").addEventListener("click", (e) => {
      const btn = e.target.closest(".qty-btn");
      if (!btn) return;
      updateCartQuantity(parseInt(btn.dataset.index), btn.classList.contains("plus") ? 1 : -1);
    });

    // Click Gửi / Xác nhận
    sendBtn.addEventListener("click", () => {
      const isModified = sendBtn.dataset.modified === "true";

      if (isModified) {
          // Khi bấm xác nhận: Chụp ảnh mới để coi đây là trạng thái "gốc"
          initialCartSnapshot = JSON.stringify(UI.cart.items);
          renderDrawer(); // Nút sẽ tự động về màu Xanh
        if (navigator.vibrate) navigator.vibrate(30);
        updateCartBarTotal();
        renderDrawer();

      } else {
        if (!ensureActive()) {
          openPicker();
          return; 
          }
          sendCart();
          closeOverlay();
      }
    });

    document.getElementById("drawerClose").onclick = closeOverlay;
}