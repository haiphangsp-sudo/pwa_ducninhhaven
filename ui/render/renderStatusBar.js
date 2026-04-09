import { renderStepper } from './renderStepper.js';

export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;

  const isExpanded = !!state.orders?.isBarExpanded;
  const activeOrders = state.orders?.active || [];

  const actionableOrders = activeOrders.filter(
    o => !['RECOVERING', 'CANCELED'].includes(o.status)
  );

  if (actionableOrders.length === 0) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");

  bar.className = `status-bar ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;

  const priorityOrder = actionableOrders.reduce((best, current) => {
    const scores = { DONE: 5, DELIVERING: 4, COOKING: 3, NEW: 2, SYNCING: 1 };
    return (scores[current.status] || 0) > (scores[best?.status] || 0)
      ? current
      : best;
  }, null);

  const status = priorityOrder?.status || "SYNCING";

  bar.innerHTML = `
    <div class="bar-center">
      ${renderStepper(status)}
    </div>
    <div class="bar-right">
      <div class="toggle-arrow" data-action="toggle_status" data-value="${isExpanded}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="8 18 16 12 8 6"></polyline>
        </svg>
      </div>
    </div>
  `;
}