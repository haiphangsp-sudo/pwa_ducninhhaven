

// ui/render/renderStatusBar.js
import { renderStepper } from './renderStepper.js';
import { getLocationInfo } from '../../core/placesQuery.js';


export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    const countEl = document.getElementById("orderActiveCount");
    const textEl = document.getElementById("orderStatusText");
    const btnCheck = document.getElementById("btnCheckOrders");
    const btnToggle = document.getElementById('btnToggleBar');

    btnToggle.dataset.action = "toggle_status";
    
    btnCheck.dataset.action = "open-overlay";
    btnCheck.dataset.value = "orderTrackerPage";

    if (!bar || !textEl || !countEl) return;

    const { active, isBarExpanded } = state.orders;
    const cartItems = state.cart?.items || [];
    const totalCartQty = cartItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);

    if (isBarExpanded) {
        bar.classList.add("is-collapsed", "is-expanded", "rơw", "status-bar");
    } else {
        bar.classList.remove("is-collapsed");
    }
    
    btnToggle.dataset.value = isBarExpanded;

    // 2. CHỐT CHẶN HIỂN THỊ (Ẩn toàn bộ nếu không có gì)
    if (active.length === 0 && totalCartQty === 0) {
        bar.classList.add("hidden");
        return;
    }
    bar.classList.remove("hidden");

    // 3. LOGIC NỘI DUNG (Ưu tiên Đơn hàng > Giỏ hàng)
if (active.length > 0) {
    // TRƯỜNG HỢP: Đang có đơn hàng (Hiển thị Stepper)
    const latestOrder = active[active.length - 1]; 
    countEl.textContent = active.length;
    textEl.innerHTML = renderStepper(latestOrder.status);

    // DỌN DẸP VÀ GÁN CLASS MỚI (Cách viết chuẩn)
    bar.className = 'status-bar'; // Reset về class gốc
    bar.classList.add(`is-${latestOrder.status}`);
    
    // Xử lý Expand/Collapse
    if (isBarExpanded) {
        bar.classList.add('is-expanded');
    } else {
        bar.classList.add('is-collapsed');
    }
}
else {
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
