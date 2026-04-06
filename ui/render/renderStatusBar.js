

// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';


export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    const countEl = document.getElementById("orderActiveCount");
    const textEl = document.getElementById("orderStatusText");
    const btnCheck = document.getElementById("btnCheckOrders");
    const btnToggle = document.getElementById('btnToggleBar');
    const { active, isBarExpanded } = state.orders;
    const cartItems = state.cart?.items || [];
    const totalCartQty = cartItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);

    btnToggle.dataset.action = "toggle_status";
    btnToggle.dataset.value = isBarExpanded;
    
    btnCheck.dataset.action = "open-overlay";
    btnCheck.dataset.value = "orderTrackerPage";

    if (!bar || !textEl || !countEl) return;

    // 2. CHỐT CHẶN HIỂN THỊ (Ẩn toàn bộ nếu không có gì)
    if (active.length === 0 && totalCartQty === 0) {
        bar.classList.add("hidden");
        return;
    }
    bar.classList.remove("hidden");
    const STATUS_PRIORITY = {
        'RECOVERING': 5,
        'DONE': 4,
        'DELIVERING': 3,
        'COOKING': 2,
        'NEW': 1
    };
    // 3. LOGIC NỘI DUNG (Ưu tiên Đơn hàng > Giỏ hàng)
    const latestOrder = active[active.length - 1]; 
    countEl.textContent = active.length;
    if (active.length > 0) {
        // Tìm đơn hàng có trạng thái cao nhất (tiến gần tới lúc ăn nhất)
        const priorityOrder = active.reduce((prev, current) => {
            return (STATUS_PRIORITY[current.status] > STATUS_PRIORITY[prev.status]) ? current : prev;
        });

        countEl.textContent = active.length; 
        textEl.innerHTML = renderStepper(priorityOrder.status); // Hiển thị stepper của đơn tiến xa nhất

        bar.className = 'status-bar';
        bar.classList.add(`is-${latestOrder.status}`);
        
        // Xử lý Expand/Collapse
        if (isBarExpanded) {
            bar.classList.add('is-expanded');
        } else {
            bar.classList.add('is-collapsed');
        }
    }else {
        // TRƯỜNG HỢP: Chỉ có giỏ hàng
        countEl.textContent = totalCartQty;
        const locationName = getLocationInfo()?.placeName;
        textEl.textContent = locationName
            ? `${locationName} • ${totalCartQty} món`
            : `🛒 Giỏ hàng có ${totalCartQty} món`;

        // Gán class cho trạng thái chờ
        bar.className = 'status-bar is-idle';
        if (!isBarExpanded) {
            bar.classList.add('is-collapsed');
        } else {
            bar.classList.add('is-expanded');
        }
    }
}
