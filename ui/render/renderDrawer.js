// ui/render/renderDrawer.js

import { UI } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import {
  updateCartQuantity,
  clearCart,
  dispatchAction
} from "../../core/events.js";
import { closeOverlay, showOverlay } from "../interactions/backdropManager.js";
import { MENU } from "../../core/menuStore.js";
import { getCartTotals, textItemItems } from "../utils/cartCalculators.js";
import { updateCartBarTotal } from "./renderCart.js";

let initialCartSnapshot = localStorage.getItem("haven_cart") || "[]";

export function openCartDrawer() {
  initialCartSnapshot = JSON.stringify(UI.cart.items || []);
  renderDrawer();
  showOverlay("cartDrawer");
}

export function renderDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  const items = UI.cart.items || [];
  const { totalPrice, totalUnique, isEmpty } = getCartTotals(items);
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");

  drawer.querySelector(".drawer__header-title").textContent = translate("cart_bar.cart_title");
  drawer.querySelector(".drawer__header-price").textContent =
    totalPrice > 0 ? totalPrice.toLocaleString("vi-VN") + "đ" : "";
  drawer.querySelector(".drawer__header-count").textContent = textItemItems();
  drawer.querySelector(".drawer__header-unique").textContent =
    totalUnique + " " + translate("cart_bar.unique");
  
  const currentSnapshot = JSON.stringify(items);
  const hasChanged = currentSnapshot !== initialCartSnapshot;
  if (isEmpty) {
      itemsContainer.innerHTML = `
        <div class="p-m center text-muted">
          ${translate("cart_bar.empty")}
        </div>
      `;
        // Trường hợp giỏ rỗng (ví dụ khách xóa hết món khi đang mở drawer)
        sendBtn.textContent = translate("cart_bar.close");
        sendBtn.dataset.action = "close";
        sendBtn.className = "drawer-send state-close";
  } else {
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
              ${price > 0
                ? price.toLocaleString("vi-VN") + " đ"
                : price === 0
                  ? translate("cart_bar.free")
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
    }).join("");

    if (hasChanged) {
        // Trường hợp CÓ CHỈNH SỬA số lượng so với lúc mới vào Drawer
        sendBtn.textContent = translate("cart_bar.confirm_changes");
        sendBtn.dataset.action = "confirm";
        sendBtn.className = "drawer-send state-confirm"; // Màu vàng
    } else {
        // Trường hợp giữ nguyên ý định ban đầu
        sendBtn.textContent = translate("cart_bar.send_order");
        sendBtn.dataset.action = "send";
        sendBtn.className = "drawer-send state-send"; // Màu xanh
    }
  }
}
export function resetCartSnapshot() {
  initialCartSnapshot = "[]";
  //initialCartSnapshot = JSON.stringify(UI.cart.items || []);
}

export function attachDrawerEvents() {
  const itemsRoot = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const closeBtn = document.getElementById("drawerClose");

  if (itemsRoot) {
    itemsRoot.addEventListener("click", (e) => {
      const btn = e.target.closest(".qty-btn");
      if (!btn) return;

      updateCartQuantity(
        parseInt(btn.dataset.index, 10),
        btn.classList.contains("plus") ? 1 : -1
      );
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      
      const action = sendBtn.dataset.action;
      if (action === "close") {
        closeOverlay;
        return;
      }

      const isModified = sendBtn.dataset.modified === "true";
      if (isModified) {
        initialCartSnapshot = JSON.stringify(UI.cart.items || []);
        updateCartBarTotal();
        renderDrawer();

        if (navigator.vibrate) navigator.vibrate(30);
        return;
      }

      if (action === "confirm") {
        // Logic xác nhận: Chụp lại snapshot mới
        initialCartSnapshot = JSON.stringify(UI.cart.items);
        renderDrawer(); // Render lại để nút chuyển sang màu xanh (Send)
        if (navigator.vibrate) navigator.vibrate(30);
        return;
      }

      if (action === "send") {
        dispatchAction({ type: "send_cart" });
      }
    });
  }

  if (closeBtn) {
    closeBtn.onclick = closeOverlay;
  }

  window.addEventListener("intentresume", (e) => {
    if (e.detail?.type === "send_cart") {
      openCartDrawer();
    }
  });
}