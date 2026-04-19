// ui/render/renderAck.js
import { translate } from "../utils/translate.js";

export function renderAck(state) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  const ack = state.ack;
  if (!ack?.visible) {
    el.classList.add("hidden");
    el.classList.remove("show");
    el.innerHTML = "";
    return;
  }

  const status = ack.status || "info";
  const title = ack.title ? translate(ack.title) : "";
  const message = translate(ack.message || "");
  const icon = getAckIcon(status);

  el.className = "overlay__ack";
  el.classList.add(`ack--${status}`);
  el.classList.remove("hidden");

  el.innerHTML = `
    <div class="ack__inner">
      <span class="ack__icon" aria-hidden="true">${icon}</span>
      <div class="ack__content">
        ${title ? `<div class="ack__title">${title}</div>` : ""}
        <div class="ack__message">${message}</div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    el.classList.add("show");
  });
}

let toastTimer = null;
let isShowing = false;

export function showToast({
  type = "info",
  message = "",
  duration = 2000
}) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  const msg = translate(message || "");

  // Nếu đang hiển thị → reset timer + update nội dung
  if (isShowing) {
    clearTimeout(toastTimer);
  }

  // Render nội dung
  el.innerHTML = `
    <div class="ack__inner">
      <div class="ack__icon">${getIcon(type)}</div>
      <div class="ack__content">
        <div class="ack__message">${msg}</div>
      </div>
    </div>
  `;

  // Reset class
  el.className = "overlay__ack";

  // Gắn theme
  el.classList.add(`ack--${type}`);

  // Hiện toast
  el.classList.remove("hidden");

  // Force reflow để animation chạy đúng
  el.offsetHeight;

  el.classList.add("show");

  isShowing = true;

  // Auto hide
  toastTimer = setTimeout(() => {
    hideToast(el);
  }, duration);
}

function hideToast(el) {
  el.classList.remove("show");

  setTimeout(() => {
    el.classList.add("hidden");
    el.innerHTML = "";
    isShowing = false;
  }, 220); // khớp CSS transition
}

function getIcon(type) {
  switch (type) {
    case "success": return "✓";
    case "error": return "!";
    case "sending": return "⟳";
    case "warning": return "!";
    default: return "i";
  }
}
export function switchToast(status) {
  switch (status) {
    case "waiting_place":
      showToast({type: "info",message: "toast.place_prompt",duration: 2500});
      break;

    case "queued":
      showToast({type: "queued", message: "toast.queued"});
      break;

    case "error":
      showToast({type: "error",message: "toast.error",duration: 2500});
      break;

    case "duplicate":
      showToast({type: "info",message: "toast.duplicate",duration: 2500});
      break;

    case "success":
      showToast({type: "success",message: "toast.success",duration: 2500});
      break;

    case "sending":
      showToast({type: "sending",message: "toast.sending"});
      break;

    case "added":
      showToast({ type: "success", message: "toast.added" });
      break;

    case "pending":
      showToast({ type: "info", message: "toast.pending" });
      break;

    case "idle":
    default:
      break;
  }
}