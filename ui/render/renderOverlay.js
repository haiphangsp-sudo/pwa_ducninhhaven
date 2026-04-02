// ui/render/renderOverlay.js
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
  const icon = getAckIcon(status);
  const title = ack.title ? translate(ack.title) : "";
  const message = translate(ack.message || "");

  el.className = "overlay__ack";
  el.classList.add("show", `ack--${status}`);

  el.innerHTML = `
    <div class="ack__inner">
      <span class="ack__icon" aria-hidden="true">${icon}</span>
      <div class="ack__content">
        ${title ? `<div class="ack__title">${title}</div>` : ""}
        <div class="ack__message">${message}</div>
      </div>
    </div>
  `;

  el.classList.remove("hidden");
}

function getAckIcon(status) {
  switch (status) {
    case "success":
      return "✓";
    case "error":
      return "⚠";
    case "sending":
      return "↻";
    case "info":
    default:
      return "i";
  }
}

let toastTimer = null;

export function showToast({
  type = "info",
  message = "",
  duration = 1500
}) {
  if (toastTimer) clearTimeout(toastTimer);

  setState({
    ack: {
      visible: true,
      status: type,
      message: translate(message),
      at: Date.now()
    }
  });

  if (duration > 0) {
    toastTimer = setTimeout(() => {
      setState({
        ack: {
          visible: false,
          status: null,
          message: "",
          at: Date.now() // QUAN TRỌNG
        }
      });
      toastTimer = null;
    }, duration);
  }
}
//*type: "success" | "error" | "info" | "sending"*//

export const toastSuccess = (msg) =>
  showToast({ type: "success", message: msg });

export const toastError = (msg) =>
  showToast({ type: "error", message: msg });

export const toastInfo = (msg) =>
  showToast({ type: "info", message: msg });

export const toastWarning = (msg) =>
  showToast({ type: "warning", message: msg }); 