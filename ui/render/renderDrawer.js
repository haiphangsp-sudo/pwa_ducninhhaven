// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  const namePlaceEl = document.getElementById("namePlace");

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

    // Tên món = Tên Item (VD: Phở) + Tên Option (VD: Tô lớn)
    const displayName = `${translate(info.itemLabel)} - ${translate(info.optionLabel)}`;

    return `
      <div class="drawer-item row items-center justify-between p-m border-b">
        <div class="item-info stack">
          <strong class="text-m">${displayName}</strong>
          <span class="text-s text-muted">${info.price.toLocaleString()}đ</span>
        </div>
        
        <div class="item-controls row items-center gap-m">
          <button class="btn-qty" 
                  data-action="update-qty" 
                  data-value="${cartItem.id}" 
                  data-delta="-1">—</button>
          
          <span class="font-bold">${cartItem.qty}</span>
          
          <button class="btn-qty" 
                  data-action="update-qty" 
                  data-value="${cartItem.id}" 
                  data-delta="1">+</button>
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