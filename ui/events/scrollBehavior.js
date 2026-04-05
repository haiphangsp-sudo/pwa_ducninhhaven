let lastY = window.scrollY;

export function applyScrollUI() {
  const y = window.scrollY;
  const delta = y - lastY;

  const nav = document.getElementById("contextBar");
  const hub = document.getElementById("hubMenu");
  const cart = document.getElementById("cartBar");

  if (y <= 10) {
    nav?.classList.remove("context-bar--hidden");
    hub?.classList.remove("hub-menu--hidden");
    cart?.classList.remove("cart-bar--hidden");
    lastY = y;
    return;
  }

  if (Math.abs(delta) < 6) return;

  if (delta > 0) {
    nav?.classList.add("context-bar--hidden");
    hub?.classList.add("hub-menu--hidden");
    cart?.classList.add("cart-bar--hidden");
  } else {
    nav?.classList.remove("context-bar--hidden");
    hub?.classList.remove("hub-menu--hidden");
    cart?.classList.remove("cart-bar--hidden");
  }

  lastY = y;
}
