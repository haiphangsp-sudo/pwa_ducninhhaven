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
  title = "",
  message = "",
  duration = 2000
}) {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  setState({
    ack: {
      visible: true,
      status: type,
      title,
      message,
      at: Date.now()
    }
  });

  if (duration > 0) {
    toastTimer = setTimeout(() => {
      setState({
        ack: {
          visible: false,
          status: null,
          title: "",
          message: "",
          at: Date.now()
        }
      });
      toastTimer = null;
    }, duration);
  }
}