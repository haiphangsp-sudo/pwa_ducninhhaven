import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

const STEP_KEYS = ["NEW", "COOKING", "DELIVERING", "DONE"];

/**
 * Mapping đã chốt:
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
  const lang = getState().lang.current || "vi";

  const steps = STEP_KEYS.map((key) => ({
    key,
    label: STRINGS.status?.[key]?.en || key,
  }));

  const message = getStatusMessage(currentStatus, lang, longMsg);

  return `
    ${message ? `<div class="step-status-msg${currentStatus === "SYNCING" ? " is-syncing" : ""}">${escapeHtml(message)}</div>` : ""}
    <div class="step-container${currentStatus === "SYNCING" ? " is-syncing" : ""}">
      ${steps.map((step, index) => {
        const stateClass = getStepState(index, currentStatus);
        const dotContent = stateClass === "is-complete" ? "✓" : "";

        return `
          <div class="step ${stateClass}">
            <div class="step-dot">${dotContent}</div>
            <div class="step-label">${escapeHtml(step.label)}</div>
            ${index < steps.length - 1 ? `<div class="step-line"></div>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getStepState(index, currentStatus) {
  switch (currentStatus) {
    case "SYNCING":
      return index === 0 ? "is-active is-syncing" : "is-pending";

    case "NEW":
      if (index === 0) return "is-complete";
      if (index === 1) return "is-active";
      return "is-pending";

    case "COOKING":
      if (index <= 1) return "is-complete";
      if (index === 2) return "is-active";
      return "is-pending";

    case "DELIVERING":
      if (index <= 2) return "is-complete";
      if (index === 3) return "is-active";
      return "is-pending";

    case "DONE":
      return "is-complete is-done";

    default:
      return "is-pending";
  }
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