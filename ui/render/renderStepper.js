// ui/render/renderStepper.js

import { translate } from "../../ui/utils/translate.js";

export function renderStepper(currentStatus) {
  const steps = [
    { key: 'NEW', label: translate('status.NEW') },
    { key: 'COOKING', label: translate('status.COOKING') },
    { key: 'DELIVERING', label: translate('status.DELIVERING') },
    { key: 'DONE', label: translate('status.DONE') },
    { key: 'RECOVERING', label: translate('status.RECOVERING') }
  ];

  const statusOrder = ['NEW', 'COOKING', 'DELIVERING', 'DONE', 'RECOVERING'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return `
    <div class="stepper">
      ${steps.map((step, index) => {
        let stateClass = "";

        // Nếu status là RECOVERING (thứ 5) -> Tích xanh tất cả 4 dot
        if (currentStatus === 'RECOVERING') {
          stateClass = "is-complete";
        } 
        // Nếu vị trí của status hiện tại trong mảng lớn hơn index của dot -> Dot đã xong
        else if (currentIndex > index) {
          stateClass = "is-complete";
        } 
        // Nếu vị trí status bằng đúng index của dot -> Dot đó đang Nâu (Active)
        else if (currentIndex === index) {
          stateClass = "is-active";
        } 
        else {
          stateClass = "is-pending";
        }

        return `
          <div class="step ${stateClass}">
            <div class="step-dot">
              ${stateClass === "is-complete" ? '✓' : ''}
            </div>
            <div class="step-label">${step.label}</div>
            ${index < steps.length - 1 ? '<div class="step-line"></div>' : ''}
          </div>
        `;
      }).join("")}
    </div>
  `;
}
function updateStepperUI(itemId, qty) {
  // 1. Tìm tất cả các chỗ hiển thị số lượng của món này (trong Menu và trong Drawer)
  const qtyDisplays = document.querySelectorAll(`[data-qty-id="${itemId}"]`);
  
  qtyDisplays.forEach(el => {
    // Chỉ cập nhật con số, không render lại HTML
    if (el.textContent !== String(qty)) {
      el.textContent = qty;
      
      // Hiệu ứng Wellness: Chớp nhẹ một cái để khách biết đã nhảy số
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 300);
    }
  });

  // 2. Nếu số lượng về 0 và đang ở trong Drawer, ta mới cần xóa dòng đó
  if (qty === 0) {
    const itemRow = document.querySelector(`.drawer-item[data-id="${itemId}"]`);
    if (itemRow) itemRow.remove();
  }
}


/* --- 2. Xử lý đồng bộ nút Stepper (Cộng/Trừ) --- */
export function syncStepperStates(state, prevState) {
  const currentItems = state.cart?.items || [];
  const prevItems = prevState.cart?.items || [];

  // Cập nhật các món mới hoặc thay đổi số lượng
  currentItems.forEach(item => {
    const prev = prevItems.find(i => i.id === item.id);
    if (!prev || prev.qty !== item.qty) {
      updateStepperUI(item.id, item.qty);
    }
  });

  // Reset các món vừa bị xóa khỏi giỏ
  prevItems.forEach(prevItem => {
    const stillInCart = currentItems.find(i => i.id === prevItem.id);
    if (!stillInCart) updateStepperUI(prevItem.id, 0);
  });
}
