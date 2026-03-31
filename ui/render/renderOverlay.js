// ui/render/renderAckOverlay.js

import { setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";


export  function renderAck({ visible, status, message }) {
  const el = document.getElementById("ackOverlay");
  if (!el) return;

  el.className = "overlay__ack";

  if (visible) {
    el.textContent = message || "";

    el.classList.add("show");

    if (status) {
      el.classList.add(status); // success | error | sending
    }
  } else {
    el.classList.add("hidden");
    el.textContent = "";
  }
    setTimeout(() => {
        setState({ ack: { visible: false, status: null, message: "", at: Date.now() } });
    }, 2500);
}
