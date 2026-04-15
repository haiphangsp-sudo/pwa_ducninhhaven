import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";
import { translate } from "../utils/translate.js";



const STEP_KEYS = ["NEW", "COOKING", "DELIVERING", "DONE"];

/**
 * SYNCING    -> ● ○ ○ ○
 * NEW        -> ✔ ● ○ ○
 * COOKING    -> ✔ ✔ ● ○
 * DELIVERING -> ✔ ✔ ✔ ●
 * DONE       -> ✔ ✔ ✔ ✔
 *
 * longMsg = false  => dùng msg_*
 * longMsg = true   => dùng msg_long_*
 */
export function renderStepper(currentStatus, longMsg = false) {
  const lang = getState().lang.current;

  const steps = STEP_KEYS.map((key) => ({
    key,
    label: STRINGS.status?.[key]?.en,
  }));

  const message = getStatusMessage(currentStatus, lang, longMsg);

  return `
    ${message ?
    `<div class="step-status-msg ${currentStatus === "SYNCING" ? "is-syncing" : ""}">
      ${message}
      </div>` : ""}
    <div class="step-container ${currentStatus === "SYNCING" ? "is-syncing" : ""}">
      ${steps.map((step, index) => {
        const stateClass = getStepState(index, currentStatus);
        const dotContent = stateClass === "is-complete" ? "✓" : "";

        return `
          <div class="step ${stateClass}">
            <div class="step-dot">${dotContent}</div>
            <div class="step-label">${step.label}</div>
            ${index < steps.length - 1 ? `<div class="step-line"></div>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getStepState(index, currentStatus) {
  // Định nghĩa vị trí của từng trạng thái (Trạng thái nào ứng với Step nào đang Active)
  const statusIndexes = {
    "SYNCING": 0,
    "NEW": 1,
    "COOKING": 2,
    "DELIVERING": 3,
    "DONE": 4 // DONE lớn hơn số index của các step (0-3) để tất cả đều "is-complete"
  };

  const currentIdx = statusIndexes[currentStatus] ?? -1;

  // Trường hợp đặc biệt: Đã hoàn thành toàn bộ
  if (currentStatus === "DONE") {
    return "is-complete is-done";
  }

  // Logic so sánh Index để trả về Class tương ứng
  if (index < currentIdx) {
    return "is-complete"; // ✔ (Các bước trước đó)
  } 
  
  if (index === currentIdx) {
    // ● (Bước hiện tại đang xử lý)
    return currentStatus === "SYNCING" ? "is-active is-syncing" : "is-active";
  }

  return "is-pending"; // ○ (Các bước chưa tới)
}

function getStatusMessage(status, lang, longMsg) {
  const suffix = longMsg ? "msg_long_" : "msg_";
  const key = `${suffix}${status}`;
  return STRINGS.status?.[key]?.[lang] || "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}