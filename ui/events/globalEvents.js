// ui/events/globalEvents.js

import { setState } from "../../core/state.js";
import { applyPlaceById } from "../../core/context.js";
import { dispatchAction } from "../../core/events.js";

import { attachMenuEvents } from "./menuEvents.js";
import { attachDrawerEvents } from "./drawerEvents.js";
import { attachPlacePickerEvents } from "./placePicker.js";
import { attachOrchestrator } from "../../core/events.js";

export function attachAppEvents() {
  attachMenuEvents();
  attachDrawerEvents();
  attachPlacePickerEvents();
  attachOrchestrator();

  document.addEventListener("click", handleGlobalClick);
}

/* =========================
   GLOBAL CLICK
========================= */

function handleGlobalClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const value = target.dataset.value;

  switch (action) {

    /* ---------- NAV ---------- */

    case "nav-menu":
      setState({ view: { panel: value } });
      break;

    case "open-overlay":
      setState({ view: { overlay: value } });
      break;

    case "close-overlay":
      setState({ view: { overlay: null } });
      break;

    /* ---------- PLACE ---------- */

    case "select-place":
      if (!value) return;
      setState({ view: { overlay: null } });
      applyPlaceById(value);
      break;

    /* ---------- CART / ORDER ---------- */

    case "cart":
    case "instant":
      dispatchAction({
        type: action,
        category: target.dataset.category,
        item: target.dataset.item,
        option: value,
        qty: 1
      });
      break;

    case "send_cart":
      dispatchAction({ type: "send_cart" });
      break;

    /* ---------- LANGUAGE ---------- */

    case "change-lang":
      setState({ lang: { current: value } });
      break;

    default:
      break;
  }
}