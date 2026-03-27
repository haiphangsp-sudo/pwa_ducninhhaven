// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer || drawer.classList.contains("hidden")) return;

  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const namePlaceEl = document.getElementById("namePlace");
  
  const cartItems = state.cart.items || [];
  const activePlace = state.context.active;

  // 1. Hiển thị thông tin Vị trí (Phòng/Bàn)
  if (activePlace) {
    namePlaceEl.textContent = `${translate("place.served")}: ${activePlace.name}`;
    sendBtn.dataset.action = "send_cart";
    sendBtn.classList.remove("text-warning");
  } else {
    namePlaceEl.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
    sendBtn.classList.add("text-warning");
  }

  // 2. Xử lý danh sách món ăn & Tính toán Stats
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

  let totalPrice = 0;
  let totalQty = 0;

  const html = cartItems.map(cartItem => {
    const info = getItemById(cartItem.id);
    if (!info) return ""; // Bỏ qua nếu không tìm thấy món (tránh lỗi hiển thị trắng)

    const subtotal = info.price * cartItem.qty;
    totalPrice += subtotal;
    totalQty += cartItem.qty;

    const displayName = info.parentName ? `${info.parentName} (${info.name})` : info.name;

    return `
      <div class="drawer-item row items-center justify-between p-m border-b">
        <div class="item-info stack">
          <span class="font-bold">${displayName}</span>
          <span class="text-s text-muted">${info.price.toLocaleString()}đ</span>
        </div>
        
        <div class="row items-center gap-m">
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="-1">—</button>
          <span class="qty-val font-medium">${cartItem.qty}</span>
          <button class="btn-qty" data-action="update-qty" data-value="${cartItem.id}" data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("");

  itemsContainer.innerHTML = html;

  // 3. Cập nhật nút Gửi đơn hàng
  const btnText = activePlace 
    ? `${translate("cart_bar.send_order")} • ${totalPrice.toLocaleString()}đ`
    : translate("place.select");
  
  sendBtn.textContent = btnText;
}