// ui/components/statusBar.js

import { getState, setState } from "../../core/state.js";
import { renderStatusBar } from "../render/renderStatusBar.js";




/* =========================
   PUBLIC
========================= */


export function toggleStatusBar() {
    const isExpanded = getState().orders.isBarExpanded;
    setState({ orders: { isBarExpanded: !isExpanded } });
    renderStatusBar();
}

export function renderStatusBar() {
    const { active, isBarExpanded } = getState().orders;
    const bar = document.getElementById("orderStatusBar");
    
    // Nếu không có đơn hàng nào thì ẩn luôn thanh bar
    if (active.length === 0) {
        bar.style.display = "none";
        return;
    }
    
    bar.style.display = "flex";
    bar.classList.toggle("is-collapsed", !isBarExpanded);
    
    const toggleBtn = document.getElementById("btnToggleBar");
    toggleBtn.textContent = isBarExpanded ? "❯" : "❮";
}