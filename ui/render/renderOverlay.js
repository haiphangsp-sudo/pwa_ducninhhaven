// ui/render/renderOverlay.js
import { setState } from "../../core/state.js"
import { translate } from "../utils/translate.js";

export function renderAck(state) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  const ack = state.ack;
  if (!ack?.visible) {
    el.classList.add("hidden");
    el.classList.remove("show");
    el.textContent = "";
    return;
  }

  el.textContent = translate(ack.message || "" );
  el.className = `overlay__ack ${ack.status || ""}`;
  el.classList.remove("hidden");
  el.classList.add("show");
}

let toastTimer = null;

export function showToast({ type = "info", message = "", duration = 2500 }) {
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
          at: null
        }
      });
      toastTimer = null;
    }, duration);
  }
}