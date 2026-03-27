// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const namePlaceEl = document.getElementById("namePlace");

  // Kiểm tra an toàn để không bị "màn hình trắng"
  if (!drawer || !itemsContainer || !sendBtn) return;
  if (drawer.classList.contains("hidden")) return;

  const cartItems = state.cart.items || [];
  const activePlace = state.context.active;

  // 1. Hiển thị thông tin địa điểm
  if (namePlaceEl) {
    namePlaceEl.textContent = activePlace 
      ? `${translate("place.served")}: ${activePlace.name}` 
      : translate("place.select");
  }

  // 2. Xử lý giỏ hàng trống
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="p-xl center text-muted stack items-center">
        <div class="text-xxl mb-m">🛒</div>
        <p>${translate("cart_bar.empty")}</p>
      </div>`;
    
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "cartDrawer";
    return;
  }

  // 3. Vẽ danh sách món ăn
  let totalPrice = 0;
  const htmlRows = cartItems.map(cartItem => {
    const info = getItemById(cartItem.id);
    if (!info) return ""; // Bỏ qua món lỗi, không làm hỏng cả danh sách

    const subtotal = info.price * cartItem.qty;
    totalPrice += subtotal;

    return `
      <div class="drawer-item row items-center justify-between p-m border-b">
        <div class="stack">
          <strong class="text-m">${info.name}</strong>
          <span class="text-s text-muted">${info.price.toLocaleString()}đ</span>
        </div>
        <div class="row items-center gap-m">
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="-1">—</button>
          <span class="font-bold">${cartItem.qty}</span>
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("");

  itemsContainer.innerHTML = htmlRows;

  // 4. Cấu hình nút gửi đơn
  if (activePlace) {
    sendBtn.textContent = `${translate("cart_bar.send_order")} • ${totalPrice.toLocaleString()}đ`;
    sendBtn.dataset.action = "send_cart";
    sendBtn.classList.remove("text-warning");
  } else {
    sendBtn.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
    sendBtn.classList.add("text-warning");
  }
}