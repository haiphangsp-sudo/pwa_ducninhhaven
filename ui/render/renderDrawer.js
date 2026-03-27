// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const namePlaceEl = document.getElementById("drawerPlaceDisplay");

  // CHỐT CHẶN 1: Nếu không thấy Drawer hoặc đang ẩn thì thoát ngay, tránh crash
  if (!drawer || drawer.classList.contains("hidden")) return;
  if (!itemsContainer || !sendBtn) return;

  const cartItems = state.cart.items || [];
  const activePlace = state.context.active;

  // 1. Cập nhật thông tin địa điểm (Header)
  if (namePlaceEl) {
    namePlaceEl.textContent = activePlace 
      ? `${translate("place.served")}: ${activePlace.name}` 
      : translate("place.select");
  }

  // 2. Xử lý Giỏ hàng trống
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="p-xl center text-muted stack items-center">
        <div class="text-xxl mb-m">🛒</div>
        <p>${translate("cart_bar.empty") || "Giỏ hàng đang trống"}</p>
      </div>`;
    
    sendBtn.textContent = translate("cart_bar.close") || "Đóng";
    sendBtn.dataset.action = "close-overlay";
    sendBtn.dataset.value = "cartDrawer";
    
    // Ẩn các phần thống kê phụ nếu có
    const summary = drawer.querySelector(".drawer-summary");
    if (summary) summary.classList.add("hidden");
    return;
  }

  // 3. Vẽ danh sách món ăn & Tính tổng
  let totalPrice = 0;
  let totalQty = 0;

  const html = cartItems.map(cartItem => {
    const info = getItemById(cartItem.id); // Dùng hàm chuẩn bạn cung cấp
    
    if (!info) return ""; // Phòng hờ ID lỗi

    const subtotal = info.price * cartItem.qty;
    totalPrice += subtotal;
    totalQty += cartItem.qty;

    return `
      <div class="drawer__item drawer-item">
      <div class="drawer__info">
        <strong>${translate(info.itemLabel)}</strong>
        <span class="drawer__variant">${translate(info.optionLabel)}</span>
        <span class="text-s text-muted">
          ${info.price > 0
            ? info.price.toLocaleString("vi-VN") + " đ"
            : info.price === 0
              ? translate("cart_bar.free")
              : translate("cart_bar.instant")
          }
        </span>
      </div>

      <div class="drawer-qty row items-center gap-s">
        <button
          class="qty-btn min"
          data-action="update-qty"
          data-option-id="${cartItem.id}"
          data-delta="-1"
          type="button">-</button>
        <span class="qty-val weight-600">${cartItem.qty}</span>
        <button
          class="qty-btn plus"
          data-action="update-qty"
          data-option-id="${cartItem.id}"
          data-delta="1"
          type="button">+</button>
      </div>
    </div>
    `;
  }).join("");

  itemsContainer.innerHTML = html;

  // 4. Cập nhật Footer (Nút gửi đơn)
  const summary = drawer.querySelector(".drawer-summary");
  if (summary) summary.classList.remove("hidden");

  if (activePlace) {
    // Nếu đã chọn phòng: Hiện nút "Gửi đơn"
    sendBtn.textContent = `${translate("cart_bar.send_order")} • ${totalPrice.toLocaleString()}đ`;
    sendBtn.dataset.action = "send_cart";
    sendBtn.classList.remove("text-warning");
  } else {
    // Nếu chưa chọn phòng: Hiện nút "Chọn phòng"
    sendBtn.textContent = translate("place.select");
    sendBtn.dataset.action = "open-overlay";
    sendBtn.dataset.value = "placePicker";
    sendBtn.classList.add("text-warning");
  }
}