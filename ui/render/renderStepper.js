// ui/render/renderStepper.js
import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

export function renderStepper(currentStatus, longMsg = false) {
  const lang = getState().lang.current || "vi";

  const steps = [
    {
      key: "NEW",
      label: STRINGS.status.NEW?.en || "Received",
      msg: STRINGS.status.msg_NEW?.[lang] || "",
      msgLong: STRINGS.status.msg_long_NEW?.[lang] || ""
    },
    {
      key: "COOKING",
      label: STRINGS.status.COOKING?.en || "Preparing",
      msg: STRINGS.status.msg_COOKING?.[lang] || "",
      msgLong: STRINGS.status.msg_long_COOKING?.[lang] || ""
    },
    {
      key: "DELIVERING",
      label: STRINGS.status.DELIVERING?.en || "Delivering",
      msg: STRINGS.status.msg_DELIVERING?.[lang] || "",
      msgLong: STRINGS.status.msg_long_DELIVERING?.[lang] || ""
    },
    {
      key: "DONE",
      label: STRINGS.status.DONE?.en || "Completed",
      msg: STRINGS.status.msg_DONE?.[lang] || "",
      msgLong: STRINGS.status.msg_long_DONE?.[lang] || ""
    }
  ];

  // thứ tự logic đầy đủ, có SYNCING/RECOVERING
  const statusOrder = ["SYNCING", "NEW", "COOKING", "DELIVERING", "DONE", "RECOVERING"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getMessage = () => {
    if (currentStatus === "SYNCING") {
      return longMsg
        ? STRINGS.status.msg_long_SYNCING?.[lang] || STRINGS.status.msg_SYNCING?.[lang] || ""
        : STRINGS.status.msg_SYNCING?.[lang] || "";
    }

    if (currentStatus === "RECOVERING") {
      return longMsg
        ? STRINGS.status.msg_long_RECOVERING?.[lang] || STRINGS.status.msg_RECOVERING?.[lang] || ""
        : STRINGS.status.msg_RECOVERING?.[lang] || "";
    }

    const currentStep = steps.find(step => step.key === currentStatus);
    if (!currentStep) return "";

    return longMsg ? currentStep.msgLong : currentStep.msg;
  };

  // visual index chỉ áp dụng cho 4 step thật
  const getVisualIndex = () => {
    if (currentStatus === "SYNCING") return -1;
    if (currentStatus === "RECOVERING") return steps.length;
    return steps.findIndex(step => step.key === currentStatus);
  };

  const currentMsg = getMessage();
  const visualIndex = getVisualIndex();
  const syncingClass = currentStatus === "SYNCING" ? " is-syncing" : "";

  return `
    ${currentMsg ? `<div class="step-status-msg${syncingClass}">${escapeHtml(currentMsg)}</div>` : ""}
    <div class="step-container${syncingClass}">
      ${steps.map((step, index) => {
        let stateClass = "is-pending";

        if (currentStatus === "RECOVERING") {
          stateClass = "is-complete";
        } else if (currentStatus === "SYNCING") {
          stateClass = "is-pending";
        } else if (visualIndex > index) {
          stateClass = "is-complete";
        } else if (visualIndex === index) {
          stateClass = "is-active";
        }

        const extraSyncingClass =
          currentStatus === "SYNCING" && index === 0 ? " is-syncing" : "";

        return `
          <div class="step ${stateClass}${extraSyncingClass}">
            <div class="step-dot${extraSyncingClass}">
              ${stateClass === "is-complete" ? "✓" : ""}
            </div>
            <div class="step-label">${escapeHtml(step.label)}</div>
            ${index < steps.length - 1 ? `<div class="step-line"></div>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}