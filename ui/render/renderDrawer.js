// ui/render/renderDrawer.js

import { translate } from "../utils/translate.js";
import { updateCartQuantity } from "../../core/events.js";
import { showOverlay } from "../interactions/backdropManager.js";
import { getCartStats, getFullCartItems } from "../../ui/utils/cartHelpers.js";
import { getContext } from "../../core/context.js";

let initialCartSnapshot = localStorage.getItem("haven_cart") || "[]";
let drawerBound = false;

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
  if (!itemsContainer || !sendBtn || !headerSummary) return;

  const cartItems = state.cart.items || [];
  const displayItems = getFullCartItems(cartItems).filter(Boolean);
  const stats = getCartStats(displayItems);

  drawer.querySelector(".drawer__header-title").textContent = translate("cart_bar.cart_title");
  drawer.querySelector(".drawer__header-price").textContent = stats.totalPriceFormat;
  drawer.querySelector(".drawer__header-count").textContent = stats.textFull;
  drawer.querySelector(".drawer__header-unique").textContent = stats.textLine;

  const hasChanged = JSON.stringify(cartItems) !== initialCartSnapshot;

  if (stats.isEmpty) {
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
    return;
  }

  headerSummary.classList.remove("hidden");

  itemsContainer.innerHTML = displayItems.map((item, index) => `
    <div class="drawer__item drawer-item">
      <div class="drawer__info">
        <strong>${item.name || item.item}</strong>
        <span class="drawer__variant">${item.optionLabel || ""}</span>
        <span class="text-s text-muted">
          ${item.price > 0
            ? item.price.toLocaleString("vi-VN") + " đ"
            : item.price === 0
              ? translate("cart_bar.free")
              : translate("cart_bar.instant")
          }
        </span>
      </div>

      <div class="drawer-qty row items-center gap-s">
        <button class="qty-btn min" data-index="${index}" type="button">-</button>
        <span class="qty-val weight-600">${item.qty}</span>
        <button class="qty-btn plus" data-index="${index}" type="button">+</button>
      </div>
    </div>
  `).join("");

  sendBtn.textContent = hasChanged
    ? translate("cart_bar.confirm_changes")
    : translate("cart_bar.send_order");

  sendBtn.dataset.action = hasChanged ? "confirm" : "send_cart";
  sendBtn.className = hasChanged ? "drawer-send state-confirm" : "drawer-send state-send";
}

export function attachDrawerEvents() {
  if (drawerBound) return;
  drawerBound = true;

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;

    updateCartQuantity(
      parseInt(btn.dataset.index, 10),
      btn.classList.contains("plus") ? 1 : -1
    );
  });
}