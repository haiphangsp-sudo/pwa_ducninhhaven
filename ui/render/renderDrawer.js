// ui/render/renderDrawer.js
import { translate } from "../utils/translate.js";
import { getVariantById } from "../../core/menuQuery.js";

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

  cartItems.forEach(line => {
    const info = getVariantById(line.id); 
    if (!info) return;

    totalPrice += info.price * info.qty;
    totalQty += info.qty;

    validItemsHtml.push(`
      <div class="drawer__item row items-center justify-between p-m border-b">
        <div class="drawer__info">
        <strong>${translate(info.productLabel)}</strong>
        <span class="drawer__variant">${translate(info.variantLabel)}</span>
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
          <button class="qty-btn" data-action="update-qty" data-value="${info.id}" data-delta="-1">—</button>
          <span class="qty-val">${info.qty}</span>
          <button class="qty-btn" data-action="update-qty" data-value="${info.id}" data-delta="1">+</button>
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
  updateEl(".drawer__header-count", `${totalQty} ${totalQty>1?translate("cart_bar.items"):translate("cart_bar.item")}`);
  updateEl(".drawer__header-unique", `${cartItems.length} ${translate("cart_bar.unique")}`);

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
    namePlaceEl.textContent = activePlace?.id
      ? `${translate("place.served")}: ${activePlace.id}`
      : translate("place.hello");
  }
}