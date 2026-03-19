// ui/render/renderRecovery.js
// Banner phục hồi đơn hàng cũ

import { translate } from "../utils/translate.js";

let state = "idle";

export function setRecoveryState(s) {
  state = s;
  render();
}

function render() {
  const el = document.getElementById("recoveryBanner");
  if (!el) return;

  if (state === "idle") {
    el.className = "recovery-banner hidden";
    return;
  }

  // Theme cho recovery thường là màu cam/vàng để nhắc nhở
  el.className = `recovery-banner banner-warning active`;
  
  el.innerHTML = `
    <div class="banner-content">
      <span class="banner-icon">↻</span>
      <span class="banner-text">${translate(`recovery.${state}`)}</span>
    </div>
  `;

  if (state === "found") {
    el.onclick = () => {
      setRecoveryState("sending");
      window.dispatchEvent(new Event("resumeQueue"));
    };
  } else {
    el.onclick = null;
  }
}