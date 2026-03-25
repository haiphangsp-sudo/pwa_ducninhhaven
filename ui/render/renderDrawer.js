// ui/render/renderDrawer.js

import { translate } from "../utils/translate.js";
import { changeCartQtynew } from "../../core/actions.js";
import { showOverlay } from "../interactions/backdropManager.js";
import { getCartStats } from "../../ui/utils/cartHelpers.js";
import { getContext } from "../../core/context.js";
import { getFullCartItems, getFullItemInfo } from "../../ui/utils/cartHelpers.js";



/* =========================
   PUBLIC
========================= */


let initialCartSnapshot = localStorage.getItem("haven_cart") || "[]";

export function openCartDrawer(state) {
  initialCartSnapshot = JSON.stringify(state.cart.items || []);
  renderDrawer(state);
  showOverlay("cartDrawer");
}

export function renderDrawer(state) {

  const drawer = document.getElementById("cartDrawer");
  const placeEl = document.getElementById("drawerPlaceDisplay");

  if (!drawer) return;
  const ctx = getContext();
  const activePlace = ctx?.active;

  if (placeEl) {
    if (activePlace) {
      placeEl.textContent = activePlace.id; 
      placeEl.classList.remove("text-warning");
    } else {
      placeEl.textContent = translate("cart_bar.place_prompt");
      placeEl.classList.add("text-warning");
    }
  }

  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const headerSummary = drawer.querySelector(".drawer-summary");

  const cartItems = state.cart.items;
  const { totalPriceFormat, textLine, isEmpty, textFull } = getCartStats(cartItems);

  drawer.querySelector(".drawer__header-title").textContent = translate("cart_bar.cart_title");
  drawer.querySelector(".drawer__header-price").textContent = totalPriceFormat;
  drawer.querySelector(".drawer__header-count").textContent = textFull;
  drawer.querySelector(".drawer__header-unique").textContent = textLine;
  
  
  const hasChanged = JSON.stringify(cartItems) !== initialCartSnapshot;

  if (isEmpty) {

    initialCartSnapshot = "[]";
    itemsContainer.innerHTML = `
      <div class="p-m center text-muted">
        ${translate("cart_bar.empty")}
      </div>
    `;
    headerSummary.classList.add("hidden");
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "cartDrawer";
    sendBtn.className = "drawer-send state-close";

  } else {

    headerSummary.classList.remove("hidden");
    const keys = getFullItemInfo(cartItems);

    itemsContainer.innerHTML = cartItems.map((item, index) => {

      const option = getFullCartItems(item);  
      
      return `
        <div class="drawer__item drawer-item">
          <div class="drawer__info">
          
            <strong>${translate(keys.name)}</strong>
            <span class="drawer__variant">${translate(option.label)}</span>
            <span class="text-s text-muted">
              ${option.price > 0
                ? option.price.toLocaleString("vi-VN") + " đ"
                : option.price === 0
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
        sendBtn.dataset.action = "send_cart";
        sendBtn.className = "drawer-send state-send"; // Màu xanh
    }
  }
}

/**
 * Reset mốc so sánh giỏ hàng
 * @param {boolean} toEmpty - Nếu true sẽ reset về rỗng, nếu false sẽ reset về trạng thái hiện tại
 */

export function attachDrawerEvents() {
    document.getElementById("drawerItems").addEventListener("click", (e) => {
      const btn = e.target.closest(".qty-btn");
      if (!btn) return;
      changeCartQtynew(
        parseInt(btn.dataset.index, 10),
        btn.classList.contains("plus") ? 1 : -1
      );
    });
}