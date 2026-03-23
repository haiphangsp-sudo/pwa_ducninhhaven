// ui/events/globalEvents.js
import { setState, getState } from "../../core/state.js";
import { attachCartBarEvents } from "../render/renderCart.js";
import { networkBackEvent } from "../../services/network.js";
import { resetIdleTimer } from "../../core/idle.js";
import { attachMenuEvents } from "../components/categoryOption.js";
import { setDeliveryState } from "../render/renderDelivery.js";
import { setRecoveryState } from "../render/renderRecovery.js";
import { attachDrawerEvents } from "../render/renderDrawer.js";
import { syncContextToState } from "../../core/state.js";
import { attachOrchestrator } from "../../core/events.js";
import { closeOverlay } from "../interactions/backdropManager.js";
import { syncOrdersWithServer } from "../../core/orders.js";
import { attachStatusBarEvents } from "../render/renderStatusBar.js";
import { selectPlace } from "../components/placePicker.js";
import { renderStatusBar } from '../../ui/render/renderStatusBar.js';
import { renderDrawer } from '../../ui/render/renderDrawer.js';
import { renderCartBar } from '../../ui/render/renderCart.js';
import { renderNavBar } from '../../ui/components/navBar.js';
import { renderHub } from '../../ui/render/renderHub.js';
import { showOverlay } from '../../ui/interactions/backdropManager.js';
import { renderPlacePicker } from '../../ui/render/renderPlacePicker.js';


export function initGlobalEvents() {
    // 1. Gắn các sự kiện cũ (nếu bạn chưa chuyển hết sang data-action)
    // attachMenuEvents();

    // 2. Bộ lắng nghe TOÀN CỤC (Event Delegation)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const { action, value } = target.dataset;

        switch (action) {
            case 'nav-menu': // Chuyển panel chính (intro, food...)
                setState({ view: { panel: value } });
                break;

            case 'open-overlay': // Mở PlacePicker, Tracker...
                setState({ view: { overlay: value } });
                break;

            case 'close-overlay':
                setState({ view: { overlay: null } });
                break;

            case 'select-place': // Chọn phòng/bàn cụ thể
                if (value) selectPlace(value);
                break;

            case 'change-lang':
                setState({ lang: { current: value } });
                localStorage.setItem("haven_lang", value);
                break;

            default:
                console.warn("Hành động chưa được định nghĩa:", action);
        }
    });

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

    renderHub();
    renderPanel();
    attachMenuEvents();
    attachCartBarEvents();
    networkBackEvent(); 
    attachDrawerEvents();
    attachOrchestrator();
    attachStatusBarEvents();
    setDeliveryState("idle");
    setRecoveryState("idle");

}
export function changLang() {
    renderHub();
    renderPanel();
}