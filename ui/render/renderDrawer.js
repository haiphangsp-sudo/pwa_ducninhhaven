// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getDrawerExtended } from "../../core/menuQuery.js";
import { getLocationInfo } from "../../core/placesQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  const panel = drawer.querySelector(".drawer-panel");
  const drawerHeader = drawer.querySelector(".drawer__header-title");
  const namePlace = document.getElementById("namePlace");
  const totalEl = drawer.querySelector(".drawer__header-price");
  const countEl = drawer.querySelector(".drawer__header-count");
  const uniqueEl = drawer.querySelector(".drawer__header-unique");
  const itemsEl = document.getElementById("drawerItems");
  const summaryEl = drawer.querySelector(".drawer-summary");
  const sendBtn = document.getElementById("drawerSend");

  if (!itemsEl || !sendBtn) return;

  const {
    items,
    totalQtyFormat,
    itemUnique,
    isEmpty,
    totalPriceFormat
  } = getDrawerExtended(state);

  const deliveryState = state.delivery.state || "idle";
  const { hasPlace, placeName } = getLocationInfo();

  if (panel && !panel.classList.contains("transform-animated")) {
    panel.classList.add("transform-animated");
  }

  drawerHeader.textContent = translate("cart_bar.cart_title");

  if (isEmpty) {
    if (summaryEl) summaryEl.classList.add("hidden");

    itemsEl.innerHTML = `
      <div class="center text-muted stack items-center">
        <div class="text-xxl">🛒</div>
        <p>${translate("cart_bar.empty")}</p>
      </div>
    `;

    if (totalEl) totalEl.textContent = "0 đ";
    if (countEl) countEl.textContent = "0";
    if (uniqueEl) uniqueEl.textContent = "0";
    if (namePlace) namePlace.textContent = hasPlace ? placeName : translate("place.button_nav");

    drawerSend(null, null, null, isEmpty)
  }

  if (summaryEl) summaryEl.classList.remove("hidden");
  if (totalEl) totalEl.textContent = totalPriceFormat;
  if (countEl) countEl.textContent = totalQtyFormat;
  if (uniqueEl) uniqueEl.textContent = itemUnique;
  if (namePlace) namePlace.textContent = hasPlace ? placeName : translate("place.button_nav");

  itemsEl.innerHTML = items.map(item => `
    <div class="drawer__item drawer-item" data-id="${item.id}">
      <div class="drawer__info">
        <strong>${item.productLabel}</strong>
        <span class="drawer__variant text-xs opacity-70">${item.variantLabel}</span>
        <span class="text-s font-bold">${item.priceFormat}</span>
      </div>
      <div class="drawer-qty row items-center gap-s">
        <button
          class="qty-btn"
          data-action="update-qty"
          data-value="${item.id}"
          data-option="-1"
          ${isQtyLocked(deliveryState) ? "disabled" : ""}
        >-</button>
        <span class="qty-val" data-qty-id="${item.id}">${item.qty}</span>
        <button
          class="qty-btn"
          data-action="update-qty"
          data-value="${item.id}"
          data-option="1"
          ${isQtyLocked(deliveryState) ? "disabled" : ""}
        >+</button>
      </div>
    </div>
  `).join("");

  drawerSend(sendBtn, deliveryState, hasPlace, null)
}

function isQtyLocked(deliveryState) {
  return deliveryState === "queued" ||
         deliveryState === "sending" ||
         deliveryState === "sent";
}
function drawerSend(sendBtn, deliveryState, hasPlace, isEmpty) {
  sendBtn.classList.remove("is-loading", "is-warning", "is-disabled");

  if (isEmpty) {
    sendBtn.textContent = translate("button.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "";
    sendBtn.dataset.option = "";
    sendBtn.dataset.extra = "";
    return;
  }

   // 1. chưa có place
  if (!hasPlace) {
    sendBtn.textContent = translate("button.place_prompt");
    sendBtn.classList.add("is-warning");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
    sendBtn.dataset.option = "";
    sendBtn.dataset.extra = "cartDrawer";
    return;
  }

  // 2. queued
  if (deliveryState === "queued") {
    sendBtn.textContent = translate("button.queued");
    sendBtn.classList.add("is-loading", "is-disabled");
    sendBtn.dataset.action = "";
    sendBtn.dataset.value = "queued";
    sendBtn.dataset.option = "";
    sendBtn.dataset.extra = "";
    return;
  }

  // 3. sending
  if (deliveryState === "sending") {
    sendBtn.textContent = translate("button.sending");
    sendBtn.classList.add("is-loading", "is-disabled");
    sendBtn.dataset.action = "";
    sendBtn.dataset.value = "sending";
    sendBtn.dataset.option = "";
    sendBtn.dataset.extra = "";
    return;
  }

  // 4. sent
  if (deliveryState === "sent") {
    sendBtn.textContent = translate("button.sent");
    sendBtn.classList.add("is-disabled");
    sendBtn.dataset.action = "";
    sendBtn.dataset.value = "sent";
    sendBtn.dataset.option = "";
    sendBtn.dataset.extra = "";
    return;
  }

  // 5. failed
  if (deliveryState === "failed") {
    sendBtn.textContent = translate("button.failed");
    sendBtn.classList.add("is-warning", "is-disabled");
    sendBtn.dataset.action = "";
    sendBtn.dataset.value = "failed";
    sendBtn.dataset.option = "";
    sendBtn.dataset.extra = "";
    return;
  }

  // 6. idle / default
  sendBtn.textContent = translate("button.send_order");
  sendBtn.dataset.action = "send_cart";
  sendBtn.dataset.value = "cart";
  sendBtn.dataset.option = "";
  sendBtn.dataset.extra = "";
}