import { DELIVERY_STATES } from "../../core/deliveryStates.js";

let currentDeliveryState = "idle";

export function setDeliveryState(nextState) {
  currentDeliveryState = nextState;
  renderDeliveryState();
}

export function getDeliveryState() {
  return currentDeliveryState;
}

export function renderDeliveryState() {
  const state = DELIVERY_STATES[currentDeliveryState] || DELIVERY_STATES.idle;

  renderSendButton(state);
  renderDeliveryBanner(state);
}

function renderSendButton(state) {
  const btn = document.querySelector(".send-button");
  if (!btn) return;

  btn.disabled = !state.canSend;
  btn.dataset.state = currentDeliveryState;
  btn.textContent = state.buttonKey;
}

function renderDeliveryBanner(state) {
  const banner = document.querySelector(".delivery-banner");
  if (!banner) return;

  if (!state.banner) {
    banner.innerHTML = "";
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  banner.textContent = state.banner;
}