// ui/render/renderAck.js
import { setState } from "../../core/state.js"
import { translate } from "../utils/translate.js";

export function renderAck(state) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  const ack = state?.ack;
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

function getAckIcon(status) {
  switch (status) {
    case "success": return "✓";
    case "error": return "!";
    case "sending": return "↻";
    default: return "i";
  }
}

let toastTimer = null;

export function showToast({
  type = "info",
  message = "",
  action = null,
  duration = 3000
}) {
  const container = document.getElementById("ackOverlay");
  if (!container) return;

  const msg = translate(message || "");

  // clear trước
  if (toastTimer) clearTimeout(toastTimer);

  container.innerHTML = `
    <div class="toast toast--${type}">
      <span class="toast__message">${msg}</span>
      ${action ? `<button class="toast__action">${action.label}</button>` : ""}
    </div>
  `;

  container.classList.remove("hidden");

  toastTimer = setTimeout(() => {
    container.classList.add("hidden");
    container.innerHTML = "";
  }, duration);

  if (action) {
    const btn = container.querySelector(".toast__action");
    if (btn) {
      btn.onclick = () => {
        action.onClick?.();
        container.classList.add("hidden");
        container.innerHTML = "";
      };
    }
  }
}
export function switchToast(status) {
  switch (status) {
    case "waiting_place":
      showToast({type: "info",message: "cart_bar.place_prompt",duration: 2500});
      break;

    case "queued":
      showToast({type: "queued", message: "cart_bar.queued"});
      break;

    case "error":
      showToast({type: "error",message: "cart_bar.error",duration: 2500});
      break;

    case "duplicate":
      showToast({type: "info",message: "cart_bar.duplicate",duration: 2500});
      break;

    case "success":
      showToast({type: "success",message: "cart_bar.success",duration: 2500});
      break;

    case "sending":
      showToast({type: "sending",message: "cart_bar.sending"});
      break;

    case "added":
      showToast({ type: "success", message: "cart_bar.added" });
      break;

    case "pending":
      showToast({ type: "info", message: "cart_bar.pending" });
      break;

    case "idle":
    default:
      break;
  }
}