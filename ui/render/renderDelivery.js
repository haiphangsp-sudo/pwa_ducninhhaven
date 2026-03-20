// ui/render/renderDelivery.js
// Banner hiển thị trạng thái đơn hàng (sending, sent, failed)

import { translate } from "../utils/translate.js";

let state = "idle";

export function setDeliveryState(s) {
  state = s;
  render();
}

function render() {
  const el = document.getElementById("deliveryBanner");
  if (!el) return;

  if (state === "idle") {
    el.className = "delivery-banner hidden";
    return;
  }

  // Cấu trúc nội dung chuyên nghiệp
  let icon = "...";
  let theme = "banner-info";

  if (state === "sent") {
    icon = "✓";
    theme = "banner-success";
  } else if (state === "failed") {
    icon = "!";
    theme = "banner-error";
  }
  if (state === "sending") {
    icon = `<span class="loader loader-invert"></span>`;
  }
  el.className = `delivery-banner ${theme} active`;
  el.innerHTML = `
    <div class="banner-content">
      <span class="banner-icon">${icon}</span>
      <span class="banner-text">${translate(`delivery.${state}`)}</span>
    </div>
  `;

  // Chỉ trạng thái lỗi mới cho phép nhấn để thử lại
  if (state === "failed") {
    el.onclick = () => {
      // Phát sự kiện để queue.js bắt đầu xử lý lại
      window.dispatchEvent(new Event("resumeQueue"));
    };
  } else {
    el.onclick = null;
  }
}