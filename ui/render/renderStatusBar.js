

// ui/render/renderStatusBar.js
import { translate } from '../utils/translate.js';
import { renderStepper } from './renderStepper.js';

export function renderStatusBar(state) {
    const bar = document.getElementById("orderStatusBar");
    const countEl = document.getElementById("orderActiveCount");
    const textEl = document.getElementById("orderStatusText");
    const btnCheck = document.getElementById("btnCheckOrders");
    
    if (!bar || !textEl || !countEl) return;

    const { active, isBarExpanded } = state.orders;
    const cartItems = state.cart?.items || [];
    const totalCartQty = cartItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);

    // 1. QUẢN LÝ ĐÓNG/MỞ (is-collapsed)
    if (isBarExpanded) {
        bar.classList.remove("is-collapsed");
    } else {
        bar.classList.add("is-collapsed");
    }

    // 2. CHỐT CHẶN HIỂN THỊ (Ẩn toàn bộ nếu không có gì)
    if (active.length === 0 && totalCartQty === 0) {
        bar.classList.add("hidden");
        return;
    }
    bar.classList.remove("hidden");

    // 3. LOGIC NỘI DUNG (Ưu tiên Đơn hàng > Giỏ hàng)
    if (active.length > 0) {
        // TRƯỜNG HỢP: Đang có đơn hàng (Hiển thị Stepper)
        const latestOrder = active[active.length - 1]; // Lấy đơn mới nhất
        countEl.textContent = active.length; // Số lượng đơn đang chạy
        textEl.innerHTML = renderStepper(latestOrder.status);
        bar.className = `status-bar is-${latestOrder.status} ${!isBarExpanded ? 'is-collapsed' : ''}`;
    } 
    else {
        // TRƯỜNG HỢP: Chỉ có giỏ hàng
        countEl.textContent = totalCartQty;
        const locationName = state.context?.active?.name || "";
        textEl.textContent = locationName 
            ? `${locationName} • ${totalCartQty} món`
            : `🛒 Giỏ hàng có ${totalCartQty} món`;
        bar.className = `status-bar is-idle ${!isBarExpanded ? 'is-collapsed' : ''}`;
    }
}
export function statutBarEvent() {
    
    const statusBar = document.getElementById('orderStatusBar');
    const btnToggle = document.getElementById('btnToggleBar');

    btnToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        statusBar.classList.toggle('is-collapsed');
    });

    
}

export function animateFlyToCart(startElement) {
    const target = document.querySelector('#cartBar .cart-bar__icon');
    if (!startElement || !target) return;

    // 1. Lấy tọa độ điểm đầu và điểm cuối
    const startRect = startElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // 2. Tạo phần tử bay (hạt nhân)
    const flyer = document.createElement('div');
    flyer.className = 'fly-item';
    flyer.textContent = '+1'; // Hoặc để trống nếu chỉ muốn vòng tròn màu
    
    // Đặt vị trí ban đầu tại nút bấm
    flyer.style.left = `${startRect.left + startRect.width / 2 - 15}px`;
    flyer.style.top = `${startRect.top + startRect.height / 2 - 15}px`;
    
    document.body.appendChild(flyer);

    // 3. Thực hiện bay sau 1 frame (để CSS kịp nhận vị trí đầu)
    requestAnimationFrame(() => {
        flyer.style.left = `${targetRect.left + targetRect.width / 2 - 15}px`;
        flyer.style.top = `${targetRect.top + targetRect.height / 2 - 15}px`;
        flyer.style.transform = 'scale(0.2)';
        flyer.style.opacity = '0.5';
    });

    // 4. Dọn dẹp và tạo hiệu ứng rung cho giỏ hàng
    flyer.addEventListener('transitionend', () => {
        flyer.remove();
        target.classList.add('cart-bounce');
        setTimeout(() => target.classList.remove('cart-bounce'), 400);
    });
}