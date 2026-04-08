// ui/render/renderStepper.js
import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

export function renderStepper(currentStatus) {
  const lang = getState().lang.current;
  const steps = [
    { key: 'NEW', label: STRINGS.status.NEW["en"],msg: STRINGS.status.msg_NEW[lang]},
    { key: 'COOKING', label: STRINGS.status.COOKING["en"],msg: STRINGS.status.msg_COOKING[lang]},
    { key: 'DELIVERING', label: STRINGS.status.DELIVERING["en"],msg: STRINGS.status.msg_DELIVERING[lang]},
    { key: 'DONE', label: STRINGS.status.DONE["en"],msg: STRINGS.status.msg_DONE[lang]},
  ];

  const statusOrder = ['NEW', 'COOKING', 'DELIVERING', 'DONE', 'RECOVERING'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return `
    <div class="stepper">
      ${steps.map((step, index) => {
        let stateClass = "";
        if (currentStatus === 'RECOVERING') stateClass = "is-complete";
        else if (currentIndex > index) stateClass = "is-complete";
        else if (currentIndex === index) stateClass = "is-active";
        else stateClass = "is-pending";

        return `
          <div class="step ${stateClass}">
            ${currentIndex === index? `<div class="step-status-msg">${step.msg}</div>` : ''}
            <div class="step-dot">${stateClass === "is-complete" ? '✓' : ''}</div>
            <div class="step-label">${step.label}</div>
            ${index < steps.length - 1
              ? '<div class="step-line"></div>'
              : ''}
          </div>`;
      }).join("")}
    </div>`;
}