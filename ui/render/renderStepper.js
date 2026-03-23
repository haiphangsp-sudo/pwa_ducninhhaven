// ui/render/renderStepper.js
import { translate } from "../../ui/utils/translate.js";

/* =========================
   PUBLIC
========================= */



export function renderStepper(currentStatus) {
    // Định nghĩa các bước tiến trình cho Haven
    const steps = [
        { key: 'NEW', label: translate('status.NEW') },
        { key: 'COOKING', label: translate('status.COOKING') },
        { key: 'DELIVERING', label: translate('status.DELIVERING') },
        { key: 'DONE', label: translate('status.DONE') }
    ];

    // Tìm chỉ số của trạng thái hiện tại
    const currentIndex = steps.findIndex(s => s.key === currentStatus);
    
    return `
        <div class="stepper">
            ${steps.map((step, index) => {
                let stateClass = "";
                if (index < currentIndex) stateClass = "is-complete";
                else if (index === currentIndex) stateClass = "is-active";
                else stateClass = "is-pending";

                return `
                    <div class="step ${stateClass}">
                        <div class="step-dot">
                            ${index < currentIndex ? '✓' : ''}
                        </div>
                        <div class="step-label">${step.label}</div>
                        ${index < steps.length - 1 ? '<div class="step-line"></div>' : ''}
                    </div>
                `;
            }).join("")}
        </div>
    `;
}