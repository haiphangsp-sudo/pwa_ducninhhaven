// ui/events/globalEvents.js
import { setState } from "../../core/state.js";
import { updateCartQuantity } from "../../core/action.js";
import { UI_ACTIONS } from "../actions/uiActions.js";
import { animateFlyToCart } from "../../ui/interactions/animateFlyToCart.js";
import { applyScrollUI } from "./scrollBehavior.js";

const COMMAND_MAP = {
  "open-overlay": (cmd) => setState(UI_ACTIONS.toggleOverlay(cmd)),
  "close-overlay": () => setState(UI_ACTIONS.toggleOverlay({ value: null })),
  "select-place": (cmd) => {
    const nextState = UI_ACTIONS.selectPlace(cmd);
    if (nextState) setState(nextState);
  },
  "update-qty": (cmd) => {
    const delta = parseInt(cmd.option, 10);
    if (!isNaN(delta)) updateCartQuantity(cmd.value, delta);
  },
  "add_cart": (cmd, target) => {
    setState({ order: { action: cmd.action, line: cmd.value, at: Date.now(), status: "idle" } });
    animateFlyToCart(target);
  },
  "send_cart": (cmd) => {
    setState({ order: { action: cmd.action, at: Date.now() } });
  },
  "buy_now": (cmd) => {
    setState({ order: { action: cmd.action, line: cmd.value, at: Date.now(),status: "idle" } });
  },
  "toggle_status": (cmd) => setState(UI_ACTIONS.toggleOrderStatus(cmd.value)),
  "open-panel": (cmd) => setState(UI_ACTIONS.togglePanel(cmd)),
  "change-lang": (cmd) => setState(UI_ACTIONS.changeLanguage(cmd.value))
};

export function setupEventListeners() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;

    const cmd = {
      action: target.dataset.action,
      value: target.dataset.value,
      option: target.dataset.option,
      extra: target.dataset.extra
    };

    const handler = COMMAND_MAP[cmd.action];
    if (handler) handler(cmd, target);
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
}

function handleScroll() {
  if (handleScroll.ticking) return;
  handleScroll.ticking = true;
  requestAnimationFrame(() => {
    applyScrollUI();
    handleScroll.ticking = false;
  });
}