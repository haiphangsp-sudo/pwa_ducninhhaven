// ui/render/renderDrawer.js
import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { updateCartQuantity, sendCart } from "../../core/events.js";

// Biến cờ để theo dõi trạng thái chỉnh sửa trong phiên mở giỏ hàng này
let isModified = false;

export function renderDrawer() {
  const el = document.getElementById("cartDrawer");
  if (!el) return;

  const items = UI.cart.items || [];

  // 1. Trường hợp giỏ hàng trống
  if (items.length === 0) {
    isModified = false; // Reset cờ
    el.innerHTML = `
      <div class="drawer-empty">
        <p>${translate("cart.empty")}</p>
      </div>
    `;
    return;
  }

  // 2. Vẽ nội dung giỏ hàng
  el.innerHTML = `
    <div class="drawer-container">
      <div class="drawer-header">
        <h3>${translate("cart.title")}</h3>
      </div>
      
      <div class="cart-list">
        ${items.map((item, index) => `
          <div class="cart-item">
            <div class="item-info">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${item.price ? item.price.toLocaleString() : ''}</span>
            </div>
            <div class="qty-control">
              <button class="qty-min" data-index="${index}">-</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-plus" data-index="${index}">+</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="drawer-footer">
        <button id="cartMainAction" class="btn-primary w-100 ${isModified ? 'state-confirm' : 'state-send'}">
          ${isModified ? translate("cart.confirm_changes") : translate("cart.send_order")}
        </button>
      </div>
    </div>
  `;

}

export function attachDrawerEvents() {
  const parent = document.getElementById("cartDrawer");
  if (!parent) return;

  // Sự kiện nút Tăng/Giảm
  parent.querySelectorAll(".qty-control button").forEach(btn => {
    btn.onclick = (e) => {
      const index = parseInt(btn.dataset.index);
      const isPlus = btn.classList.contains("qty-plus");
      
      // Đánh dấu là đã có sự thay đổi
      isModified = true;
      
      // Gọi hàm update từ events.js
      updateCartQuantity(index, isPlus ? 1 : -1);
      
      // Vì updateCartQuantity gọi setState, và main.js đã subscribe(renderApp),
      // nên renderDrawer sẽ tự động được gọi lại với isModified = true
      updateCartBarTotal();
    };
  });
  updateCartBarTotal();
  // Sự kiện nút Chính (Xác nhận/Gửi)
  const mainBtn = parent.querySelector("#cartMainAction");
  if (mainBtn) {
    mainBtn.onclick = () => {
      if (isModified) {
        // Nếu đang ở trạng thái Xác nhận -> chuyển về trạng thái Sẵn sàng gửi
        isModified = false;
        renderDrawer(); // Vẽ lại giao diện để nút đổi chữ thành "Gửi"
        
        // Phản hồi xúc giác nhẹ để khách biết đã xác nhận thành công
        if (navigator.vibrate) navigator.vibrate(30);
      } else {
        // Nếu không còn chỉnh sửa -> Thực hiện gửi đơn
        sendCart();
      }
    };
  }
}