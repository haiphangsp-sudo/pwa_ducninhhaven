// ui/render/renderStepper.js
import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

/**
 * Render thanh tiến trình 4 bước dựa trên 5 trạng thái từ Server
 * @param {string} currentStatus - Trạng thái hiện tại (NEW, COOKING, ...)
 */
export function renderStepper(currentStatus) {
  const lang = getState().lang?.current || 'vi';
  
  // 4 điểm hiển thị trên giao diện
  const steps = [
    { key: 'NEW', label: STRINGS.status.NEW[lang] },
    { key: 'COOKING', label: STRINGS.status.COOKING[lang] },
    { key: 'DELIVERING', label: STRINGS.status.DELIVERING[lang] },
    { key: 'DONE', label: STRINGS.status.DONE[lang] }
  ];

  // Thứ tự logic 5 bước để so sánh
  const statusOrder = ['NEW', 'COOKING', 'DELIVERING', 'DONE', 'RECOVERING'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return `
    <div class="stepper">
      ${steps.map((step, index) => {
        let stateClass = "";

        // Nếu là RECOVERING -> Tất cả các bước đều hoàn thành
        if (currentStatus === 'RECOVERING') {
          stateClass = "is-complete";
        } 
        // Nếu vị trí hiện tại của đơn hàng > vị trí của dot -> Dot đó đã xong (✓)
        else if (currentIndex > index) {
          stateClass = "is-complete";
        } 
        // Nếu vị trí hiện tại đúng bằng dot này -> Dot này đang xử lý (Màu Nâu)
        else if (currentIndex === index) {
          stateClass = "is-active";
        } 
        // Còn lại là chưa tới
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