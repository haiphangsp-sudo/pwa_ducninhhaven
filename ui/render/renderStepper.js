// ui/render/renderStepper.js



export function renderStepper(currentStatus) {
    // Định nghĩa các bước tiến trình cho Haven
    const steps = [
        { key: 'pending', label: 'Tiếp nhận' },
        { key: 'cooking', label: 'Chuẩn bị' },
        { key: 'delivering', label: 'Đang giao' },
        { key: 'done', label: 'Hoàn tất' }
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