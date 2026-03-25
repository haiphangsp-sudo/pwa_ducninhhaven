// ui/render/renderDrawer.js

import { translate } from "../utils/translate.js";
import { changeCartQtynew } from "../../core/actions.js";
import { showOverlay } from "../interactions/backdropManager.js";
import { getCartStats, getFullCartItems } from "../../ui/utils/cartHelpers.js";
import { getContext } from "../../core/context.js";

let initialCartSnapshot = localStorage.getItem("haven_cart") || "[]";
let drawerEventsBound = false;

/* =========================
   PUBLIC
========================= */

export function openCartDrawer(state) {
  initialCartSnapshot = JSON.stringify(state?.cart?.items || []);
  renderDrawer(state);
  attachDrawerEvents();
  showOverlay("cartDrawer");
}

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  const placeEl = document.getElementById("drawerPlaceDisplay");
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const headerSummary = drawer.querySelector(".drawer-summary");

  if (!itemsContainer || !sendBtn || !headerSummary) return;

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

  const cartItems = state?.cart?.items || [];
  const stats = getCartStats(cartItems);

  const titleEl = drawer.querySelector(".drawer__header-title");
  const priceEl = drawer.querySelector(".drawer__header-price");
  const countEl = drawer.querySelector(".drawer__header-count");
  const uniqueEl = drawer.querySelector(".drawer__header-unique");

  if (titleEl) titleEl.textContent = translate("cart_bar.cart_title");
  if (priceEl) priceEl.textContent = stats.totalPriceFormat;
  if (countEl) countEl.textContent = stats.textFull;
  if (uniqueEl) uniqueEl.textContent = stats.textLine;

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

  const displayItems = getFullCartItems(cartItems);

  itemsContainer.innerHTML = displayItems.map((item, index) => `
    <div class="drawer__item drawer-item">
      <div class="drawer__info">
        <strong>${translate(item.name)}</strong>
        <span class="drawer__variant">${translate(item.optionLabel)}</span>
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

  if (hasChanged) {
    sendBtn.textContent = translate("cart_bar.confirm_changes");
    sendBtn.dataset.action = "confirm";
    delete sendBtn.dataset.value;
    sendBtn.className = "drawer-send state-confirm";
  } else {
    sendBtn.textContent = translate("cart_bar.send_order");
    sendBtn.dataset.action = "send_cart";
    delete sendBtn.dataset.value;
    sendBtn.className = "drawer-send state-send";
  }
}

/* =========================
   EVENTS
========================= */

export function attachDrawerEvents() {
  if (drawerEventsBound) return;
  drawerEventsBound = true;

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;

    changeCartQtynew(
      parseInt(btn.dataset.index, 10),
      btn.classList.contains("plus") ? 1 : -1
    );
  });
}