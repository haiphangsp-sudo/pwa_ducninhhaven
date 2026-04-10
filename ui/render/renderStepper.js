// ui/render/renderStepper.js
import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

export function renderStepper(currentStatus, longMsg) {
  const lang = getState().lang.current;
  const steps = [
    { key: 'NEW', label: STRINGS.status.NEW["en"],msg: STRINGS.status.msg_NEW[lang],mgs_long: STRINGS.status.msg_long_NEW[lang]},
    { key: 'COOKING', label: STRINGS.status.COOKING["en"],msg: STRINGS.status.msg_COOKING[lang],mgs_long: STRINGS.status.msg_long_COOKING[lang]},
    { key: 'DELIVERING', label: STRINGS.status.DELIVERING["en"],msg: STRINGS.status.msg_DELIVERING[lang],mgs_long: STRINGS.status.msg_long_DELIVERING[lang]},
    { key: 'DONE', label: STRINGS.status.DONE["en"],msg: STRINGS.status.msg_DONE[lang],mgs_long: STRINGS.status.msg_long_DONE[lang]},
  ];

  const statusOrder = ['NEW', 'COOKING', 'DELIVERING', 'DONE', 'RECOVERING'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const currentMsg = steps[currentIndex]?.msg || ""; 
  const currentMsgLong = steps[currentIndex]?.mgs_long || ""; 
  return `
      <div class="step-status-msg">${!longMsg ? currentMsg : currentMsgLong}</div>
      <div class="step-container">
      ${steps.map((step, index) => {
        let stateClass = "";
        if (currentStatus === 'RECOVERING') stateClass = "is-complete";
        else if (currentIndex > index) stateClass = "is-complete";
        else if (currentIndex === index) stateClass = "is-active";
        else stateClass = "is-pending";

        return `
          <div class="step ${stateClass}">
            <div class="step-dot">${stateClass === "is-complete" ? '✓' : ''}</div>
            <div class="step-label">${step.label}</div>
            ${index < steps.length - 1
              ? '<div class="step-line"></div>'
              : ''}
          </div>`;
      }).join("")};
      </div>
  `;
}