
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
    "transitionend",
    () => {
      ghost.remove();
      cartBtn.classList.add("cart-bounce");
      setTimeout(() => cartBtn.classList.remove("cart-bounce"), 380);
    },
    { once: true }
  );
}