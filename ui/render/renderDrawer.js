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
import { getCartStats } from "../../ui/utils/cartHelpers.js";


let initialCartSnapshot = localStorage.getItem("haven_cart") || "[]";

export function openCartDrawer() {
  initialCartSnapshot = JSON.stringify(UI.cart.items || []);
  renderDrawer();
  showOverlay("cartDrawer");
}

export function renderDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const headerSummary = drawer.querySelector(".drawer-summary");

  const { totalPriceFormat, textLine, isEmpty, textFull } = getCartStats();

  drawer.querySelector(".drawer__header-title").textContent = translate("cart_bar.cart_title");
  drawer.querySelector(".drawer__header-price").textContent = totalPriceFormat;
  drawer.querySelector(".drawer__header-count").textContent = textFull;
  drawer.querySelector(".drawer__header-unique").textContent = textLine;
  
  const cartItems = UI.cart.items;
  const currentSnapshot = JSON.stringify(cartItems);
  const hasChanged = currentSnapshot !== initialCartSnapshot;
  
  if (isEmpty) {
    itemsContainer.innerHTML = `
      <div class="p-m center text-muted">
        ${translate("cart_bar.empty")}
      </div>
    `;
    headerSummary.classList.add("hidden");
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close";
    sendBtn.className = "drawer-send state-close";
  } else {
    headerSummary.classList.remove("hidden");

    itemsContainer.innerHTML = cartItems.map((item, index) => {
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

/**
 * Reset mốc so sánh giỏ hàng
 * @param {boolean} toEmpty - Nếu true sẽ reset về rỗng, nếu false sẽ reset về trạng thái hiện tại
 */
export function resetCartSnapshot(toEmpty = false) {
    if (toEmpty) {
        initialCartSnapshot = "[]";
    } else {
        initialCartSnapshot = JSON.stringify(UI.cart.items || []);
    }
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

      switch (action) {
        case "close":
          closeOverlay(); 
          break;

        case "confirm":
          // Chốt dữ liệu mới và render lại nút
          initialCartSnapshot = JSON.stringify(UI.cart.items || []);
          if (typeof updateCartBarTotal === "function") updateCartBarTotal();
          renderDrawer();
          
          if (navigator.vibrate) navigator.vibrate(30);
          break;

        case "send":
          dispatchAction({ type: "send_cart" });
          break;

        default:
          console.warn("Hành động không xác định:", action);
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