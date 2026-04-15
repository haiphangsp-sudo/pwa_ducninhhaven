// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getDrawerExtended } from "../../core/menuQuery.js";
import { getLocationInfo } from "../../core/placesQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  // Lấy các element con
  const panel = drawer.querySelector(".drawer-panel");
  const drawerHeader = drawer.querySelector(".drawer__header-title");
  const namePlace = document.getElementById("namePlace");
  const totalEl = drawer.querySelector(".drawer__header-price");
  const countEl = drawer.querySelector(".drawer__header-count");
  const uniqueEl = drawer.querySelector(".drawer__header-unique");
  const itemsEl = document.getElementById("drawerItems");
  const summaryEl = drawer.querySelector(".drawer-summary");
  const sendBtn = document.getElementById("drawerSend");

  const { items, totalQtyFormat, itemUnique, isEmpty, totalPriceFormat } = getDrawerExtended(state);

  if (isEmpty) {
    if (summaryEl) summaryEl.classList.add("hidden");
    itemsEl.innerHTML = `
    <div class="center text-muted stack items-center">
        <div class="text-xxl">🛒</div>
        <p>${translate("cart_bar.empty")}</p>
    </div>
    `
    if (totalEl) totalEl.textContent = "0 đ";
    if (countEl) countEl.textContent = "0";
    if (uniqueEl) uniqueEl.textContent = "0";
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "";
    sendBtn.classList.remove("is-loading", "is-warning");
    return;
  }

  sendBtn.dataset.option = "";
  
  drawerHeader.textContent = translate("cart_bar.cart_title");
  
  if (summaryEl) summaryEl.classList.remove("hidden");
  totalEl.textContent = totalPriceFormat;
  countEl.textContent = totalQtyFormat;
  uniqueEl.textContent = itemUnique;

  // 3. Vẽ danh sách món
  itemsEl.innerHTML = items.map(item => `
    <div class="drawer__item drawer-item" data-id="${item.id}">
      <div class="drawer__info">
        <strong>${item.productLabel}</strong>
        <span class="drawer__variant text-xs opacity-70">${item.variantLabel}</span>
        <span class="text-s font-bold">${item.priceFormat}</span>
      </div>
      <div class="drawer-qty row items-center gap-s">
        <button class="qty-btn" data-action="update-qty" data-value="${item.id}" data-option="-1">-</button>
        <span class="qty-val" data-qty-id="${item.id}">${item.qty}</span>
        <button class="qty-btn" data-action="update-qty" data-value="${item.id}" data-option="1">+</button>
      </div>
    </div>
  `).join("");

  const isSending = state?.order?.status === "sending";

  // reset class về base trước
  sendBtn.classList.remove("is-loading", "is-warning", "is-disabled");
  if (panel && !panel.classList.contains("drawer-animated")) {
    panel.classList.add("drawer-animated");
  }

  // 1. SENDING (ưu tiên cao nhất)
  if (isSending) {
    sendBtn.textContent = translate("cart_bar.sending");
    sendBtn.classList.add("is-loading", "is-disabled");
    sendBtn.dataset.value = "sending";
    return;
  }
  const { hasPlace, placeName } = getLocationInfo();
  if (!hasPlace) {
    sendBtn.textContent = translate("cart_bar.place_prompt");
    sendBtn.classList.add("is-warning");
    sendBtn.dataset.value = "placePicker";
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.extra = "cartDrawer";
    return;
  }

  // 3. NORMAL
  sendBtn.textContent = translate("cart_bar.send_request");
  sendBtn.dataset.action = "send_cart";
  sendBtn.classList.remove("is-warning", "is-disabled");
  sendBtn.dataset.value = "cart";
  sendBtn.dataset.extra = "";
  namePlace.textContent = placeName;
}
