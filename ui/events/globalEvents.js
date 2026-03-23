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
import { renderHub } from '../../ui/render/renderHub.js';
import { sendInstantOrder } from "../../services/orderService.js";
import { renderCartBar } from "../../ui/render/renderCart.js";


/* =========================
   PUBLIC
========================= */

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

            case 'select-place':
                if (value) {
                    // Thay thế hàm selectPlace(value) cũ bằng lệnh trực tiếp
                    setState({ 
                        context: { active: { id: value } },
                        view: { overlay: null } 
                    });
                    console.log(`Haven System: Đã chuyển bối cảnh sang ${value}`);
                }
                break;
            
            case "cart":
            case "instant":
                const payload = {
                    type: action,
                    category: target.dataset.category,
                    item: target.dataset.item,
                    option: value,
                    qty: 1
                };  
                handleAction(payload)
                break;
            
            case "send_cart":
                window.dispatchEvent(new CustomEvent("intentresume", {
                    detail: { type: action }
                }));
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
    renderCartBar();
    attachMenuEvents();
    attachCartBarEvents();
    networkBackEvent(); 
    attachDrawerEvents();
    attachOrchestrator();
    attachStatusBarEvents();
    setDeliveryState("idle");
    setRecoveryState("idle");
    
}

/* =========================
   PRIVATE
========================= */


export function handleAction(payload) {
    const { type, item, category, option, qty } = payload;

    switch (type) {
        /* CASE 1: THÊM VÀO GIỎ (Thêm vào State để lưu lại) */
        case 'cart':
            const currentCart = getState().cart.items || [];
            
            // Logic: Kiểm tra nếu món đã có thì tăng số lượng, chưa có thì push mới
            const updatedItems = [...currentCart, { item, category, option, qty }];
            
            setState({ cart: { items: updatedItems } });
            console.log("Haven: Đã thêm vào giỏ hàng");
            break;

        /* CASE 2: ĐẶT NGAY (Bỏ qua giỏ hàng, gửi thẳng lên Server) */
        case 'instant':
            // 1. Hiển thị trạng thái "Đang gửi..." trên UI
            setState({ view: { overlay: 'loading' } });

            // 2. Thực hiện gửi
            sendInstantOrder(payload).then(result => {
                if (result.success) {
                    // 3. Nếu thành công: Mở màn hình thông báo "Cảm ơn"
                    setState({ view: { overlay: 'order-success' } });
                    
                    // Tự động đóng thông báo sau 3 giây
                    setTimeout(() => setState({ view: { overlay: null } }), 3000);
                } else {
                    // Nếu lỗi: Hiện thông báo lỗi
                    alert("Rất tiếc, không thể gửi đơn hàng. Vui lòng thử lại!");
                    setState({ view: { overlay: null } });
                }
            });
        break;
    }
}



