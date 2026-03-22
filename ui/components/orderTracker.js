// ui/components/orderTracker.js
export function openOrderTracker() {
    const { active } = getState().orders;
    
    // Sử dụng backdropManager hiện có để mở overlay
    showOverlay("orderTrackerPage");
    
    const container = document.getElementById("orderTrackerList");
    container.innerHTML = active.map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <span class="order-id">Đơn #${order.id}</span>
                <span class="status-badge state-${order.status}">${translate(order.status)}</span>
            </div>
            <div class="order-items">${order.items.map(i => i.name).join(", ")}</div>
            <div class="order-stepper">
                ${renderStepper(order.status)}
            </div>
        </div>
    `).join("");
}