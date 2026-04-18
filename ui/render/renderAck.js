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

export function showToast({ type = "info", message = "", action = null, duration = 3000 }) {
  const container = document.getElementById("ackOverlay");
  if (!container) return;

  container.innerHTML = `
    <div class="toast toast--${type}">
      <span class="toast__message">${message}</span>
      ${action ? `<button class="toast__action">${action.label}</button>` : ""}
    </div>
  `;

  container.classList.remove("hidden");

  // clear timer cũ
  if (toastTimer) clearTimeout(toastTimer);

  // auto hide
  toastTimer = setTimeout(() => {
    container.classList.add("hidden");
    container.innerHTML = "";
  }, duration);

  // action handler
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