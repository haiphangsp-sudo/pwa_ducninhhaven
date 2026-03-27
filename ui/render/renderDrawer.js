// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

export function renderDrawer(state) {
  const drawer = document.getElementById("cartDrawer");
  const itemsContainer = document.getElementById("drawerItems");
  const sendBtn = document.getElementById("drawerSend");
  
  // 1. Chốt chặn an toàn: Không có Drawer hoặc đang đóng thì thoát
  if (!drawer || drawer.classList.contains("hidden")) return;
  if (!itemsContainer || !sendBtn) return;

  const cartItems = state.cart.items || [];
  const activePlace = state.context.active;

  // 2. Tính toán các chỉ số (Stats) dựa trên getItemById chuẩn của bạn
  let totalPrice = 0;
  let totalQty = 0;
  const validItemsHtml = [];

  cartItems.forEach(cartItem => {
    const info = getItemById(cartItem.id); // Hàm chui vào Category > Item > Option
    if (!info) return;

    totalPrice += info.price * cartItem.qty;
    totalQty += cartItem.qty;

    // Tên hiển thị kết hợp nhãn của Item và Option
    const displayName = `${translate(info.itemLabel)} - ${translate(info.optionLabel)}`;

    validItemsHtml.push(`
      <div class="drawer__item row items-center justify-between p-m border-b">
        <div class="stack">
          <strong class="text-m">${displayName}</strong>
          <span class="text-s color-brand">${info.price.toLocaleString()}đ</span>
        </div>
        <div class="row items-center gap-m">
          <button class="qty-btn" data-action="update-qty" data-value="${cartItem.id}" data-delta="-1">—</button>
          <span class="qty-val">${cartItem.qty}</span>
          <button class="qty-btn" data-action="update-qty" data-value="${cartItem.id}" data-delta="1">+</button>
        </div>
      </div>
    `);
  });

  // 3. Cập nhật các Class Header bạn yêu cầu (Dùng Safe-Update để không bị trắng màn hình)
  const updateEl = (cls, text) => {
    const el = drawer.querySelector(cls);
    if (el) el.textContent = text;
  };

  updateEl(".drawer__header-title", translate("cart_bar.cart_title"));
  updateEl(".drawer__header-price", totalPrice.toLocaleString() + " đ");
  updateEl(".drawer__header-count", `${totalQty} món`);
  updateEl(".drawer__header-unique", `${cartItems.length} dòng`);

  // 4. Hiển thị danh sách món
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `<div class="p-xl center text-muted">${translate("cart_bar.empty")}</div>`;
    sendBtn.textContent = translate("cart_bar.close");
    sendBtn.dataset.action = "close-overlay";
  } else {
    itemsContainer.innerHTML = validItemsHtml.join("");
    
    // 5. Cập nhật nút Gửi đơn hàng
    if (activePlace) {
      sendBtn.textContent = `${translate("cart_bar.send_order")} • ${totalPrice.toLocaleString()}đ`;
      sendBtn.dataset.action = "send_cart";
      sendBtn.classList.remove("is-warning");
    } else {
      sendBtn.textContent = translate("place.select");
      sendBtn.dataset.action = "open-overlay";
      sendBtn.dataset.value = "placePicker";
      sendBtn.classList.add("is-warning");
    }
  }

  // Cập nhật tên địa điểm ở Header (nếu có id namePlace)
  const namePlaceEl = document.getElementById("namePlace");
  if (namePlaceEl) {
    namePlaceEl.textContent = activePlace ? `${translate("place.served")}: ${activePlace.name}` : translate("place.select");
  }
}