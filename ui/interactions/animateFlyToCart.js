
export function animateFlyToCart(sourceEl) {
  if (!sourceEl) return;

  const cartBtn =
    document.getElementById("cartOpen") ||
    document.getElementById("cartBar");

  if (!cartBtn) return;

  const from = sourceEl.getBoundingClientRect();
  const to = cartBtn.getBoundingClientRect();

  const ghost = sourceEl.cloneNode(true);
  ghost.classList.add("fly-cart-ghost");

  const size = Math.min(from.width || 56, 72);

  ghost.style.position = "fixed";
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  ghost.style.width = `${size}px`;
  ghost.style.height = `${Math.min(from.height || size, size)}px`;
  ghost.style.margin = "0";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "9999";

  document.body.appendChild(ghost);

  const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
  const dy = (to.top + to.height / 2) - (from.top + from.height / 2);

  requestAnimationFrame(() => {
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.25)`;
    ghost.style.opacity = "0.2";
  });

  ghost.addEventListener(
    "transitionend",() => {
      ghost.remove();
      cartBtn.classList.add("cart-bounce");
      setTimeout(() => cartBtn.classList.remove("cart-bounce"), 380);
    },
    { once: true }
  );
}


 export function animateFlyToCartGeme(startElement) {
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