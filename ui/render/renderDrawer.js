// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;

  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const cartItems = state.cart.items || [];

  // 1. Kiểm tra giỏ hàng trống
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="p-xl center text-muted stack items-center">
        <div class="text-xxl">🛒</div>
        <p>${translate("cart_bar.empty")}</p>
      </div>`;
    
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
    return;
  }

  // 2. Chuyển đổi ID thành dữ liệu món ăn và vẽ từng dòng
  let totalPrice = 0;

  const htmlRows = cartItems.map(cartItem => {
    const info = getItemById(cartItem.id);
    
    // Nếu không tìm thấy món (ID sai hoặc Menu chưa load), bỏ qua dòng này
    if (!info) return ""; 

    const subtotal = (info.price || 0) * cartItem.qty;
    totalPrice += subtotal;

    const displayName = info.parentName ? `${info.parentName} (${info.name})` : info.name;

    return `
      <div class="drawer-item row items-center justify-between p-m border-b">
        <div class="item-info stack">
          <span class="font-bold">${displayName}</span>
          <span class="text-s text-muted">${info.price?.toLocaleString()}đ</span>
        </div>
        
        <div class="row items-center gap-m">
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="-1">—</button>
          <span class="font-medium">${cartItem.qty}</span>
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("");

  // 3. Cập nhật giao diện
  itemsContainer.innerHTML = htmlRows;

  // Cập nhật nút gửi đơn
  const activePlace = state.context.active;
  if (activePlace) {
    sendBtn.textContent = `${translate("cart_bar.send_order")} • ${totalPrice.toLocaleString()}đ`;
    sendBtn.dataset.action = "send_cart";
  } else {
    sendBtn.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
  }
}