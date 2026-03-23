

import { attachCartBarEvents } from "../render/renderCart.js";
import { networkBackEvent } from "../../services/network.js";
import { resetIdleTimer } from "../../core/idle.js";
import { attachMenuEvents } from "../components/categoryOption.js";
import { setDeliveryState } from "../render/renderDelivery.js";
import { setRecoveryState } from "../render/renderRecovery.js";
import { attachHubEvents } from "../render/renderHub.js";
import { attachNavBarEvents } from "../components/navBar.js";
import { attachDrawerEvents } from "../render/renderDrawer.js";
import { syncContextToState } from "../../core/state.js";
import { attachOrchestrator } from "../../core/events.js";
import { closeOverlay } from "../interactions/backdropManager.js";
import { syncOrdersWithServer } from "../../core/orders.js";
import { attachStatusBarEvents } from "../render/renderStatusBar.js";
import { setState, getState } from "../../core/state.js";
import { selectPlace } from "../components/placePicker.js";


export function attachAppEvents() {

    attachNavBarEvents();
    attachMenuEvents();
    attachCartBarEvents();
    attachHubEvents();
    networkBackEvent();
    attachDrawerEvents();
    attachOrchestrator();
    attachStatusBarEvents();

    setDeliveryState("idle");
    setRecoveryState("idle");

    ["touchstart", "pointerdown", "click"].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    window.addEventListener("contextchange", syncContextToState);
    //window.addEventListener("intentresume", () => Orchestrator.resume());
    
    window.addEventListener("keydown", e => {
        if (e.key === "Escape") closeOverlay();
    });

    syncOrdersWithServer();

    // Và lặp lại sau mỗi 45 giây (Chỉ hỏi thăm những đơn chưa DONE)
    setInterval(() => {
        const hasActiveOrders = getState().orders.active.some(o => o.status !== 'done');
        if (hasActiveOrders) {
            syncOrdersWithServer();
        }
    }, 45000);
}   

// ui/events/globalEvents.js

export function attachGlobalEvents() {
    document.addEventListener('click', (e) => {
        // Tìm phần tử gần nhất có thuộc tính data-action
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const value = target.dataset.value; // Dùng cho các trường hợp cần ID như PlaceID

        console.log(`Haven Global Event: [${action}]`);

        switch (action) {
            /* --- Chuyển Panel chính --- */
            case 'nav-menu':
                setState({ view: { panel: value } });
                updateActive(value);
                break;

            /* --- Quản lý Overlay (Picker, Tracker, Cart) --- */
            case 'open-overlay':
                setState({ view: { overlay: value } });
                break;

            case 'open-tracker':
                setState({ view: { overlay: 'tracker' } });
                break;

            case 'close-overlay':
                setState({ view: { overlay: null } });
                break;

            /* --- Hành động cụ thể --- */
            case 'select-place':
                if (value) selectPlace(value);
                break;

            case 'toggle-status-bar':
                const { isBarExpanded } = getState().orders;
                setState({ orders: { isBarExpanded: !isBarExpanded } });
                break;

            case 'refresh-orders':
                syncOrdersWithServer();
                break;

            default:
                console.warn(`Hành động chưa được định nghĩa: ${action}`);
        }
    });
}
