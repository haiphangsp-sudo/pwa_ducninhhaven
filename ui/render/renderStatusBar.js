// ui/render/renderStatusBar.js
import { STRINGS } from "../../data/i18n.js";
import { translate } from "../utils/translate.js";
import { getDrawerExtended } from "../../core/menuQuery.js";
import { renderStepper } from "../render/renderStepper.js";

/* =========================
   PUBLIC
========================= */
export function renderStatusBar(state) {
  const bar = document.getElementById("orderStatusBar");
  if (!bar) return;

  const isExpanded = !!state.orders?.isBarExpanded;
  const activeOrders = state.orders?.active || [];
  const { totalQty } = getDrawerExtended();
  const lang = state.lang?.current || 'vi';

  const actionableOrders = activeOrders.filter(o => !['RECOVERING', 'CANCELED'].includes(o.status));

  if (actionableOrders.length === 0 && totalQty === 0) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");

  // Thiết lập class trạng thái
  bar.className = `status-bar ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;

  const priorityOrder = actionableOrders.reduce((best, current) => {
    const scores = { DONE: 5, DELIVERING: 4, COOKING: 3, NEW: 2, SYNCING: 1 };
    return (scores[current.status] || 0) > (scores[best?.status] || 0) ? current : best;
  }, null);

  const status = priorityOrder?.status || "SYNCING";
  const statusMsg = STRINGS.status[`msg_${status}`]?.[lang] || "";

if (status === "SYNCING") {
    bar.innerHTML = `<div class="status-msg">${translate("order.current_status")}</div>`;
} else {
    const statusMsg = STRINGS.status[`msg_${status}`]?.[lang] || "";
    
    // Tạo cấu trúc 3 tầng: Thông báo - Chấm tiến trình - Tên trạng thái
    bar.innerHTML = `
        <div class="status-stack" style="display: flex; flex-direction: column; align-items: center;">
            <div class="status-msg-top" style="font-size: 9px; font-weight: 700; color: #2f5d46; text-transform: uppercase; margin-bottom: 2px;">
                ${statusMsg}
            </div>
            <div class="stepper-mini-wrap">
                ${renderStepper(status)}
            </div>
            <div class="status-label-bottom" style="font-size: 8px; font-weight: 800; color: #8b4513; margin-top: 2px;">
                ${status}
            </div>
        </div>
    `;
}
}