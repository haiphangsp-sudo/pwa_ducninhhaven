// ui/sync.js

import { subscribe, getState, setState } from "../../core/state.js";
import { CONFIG } from "../config.js";

import { addToCart, buyNow, sendCart } from "../../core/events.js";
import { applyPlaceById } from "../../core/context.js";

import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { renderDrawer } from "../render/renderDrawer.js";
import { renderPlacePicker } from "../render/renderPlacePicker.js";

import { showOverlay, closeOverlay } from "../interactions/backdropManager.js";

let lastState = {};
let isProcessingOrder = false;

/* =======================================================
   ENTRY
======================================================= */

export function attachUI() {
  subscribe(syncUI);
  syncUI(getState());
}

/* =======================================================
   MAIN SYNC
======================================================= */

async function syncUI(state) {
  /* ---------- OVERLAY ---------- */

  if (state.overlay?.view !== lastState.overlay?.view) {
    syncOverlay(state);
  }

  /* ---------- CONTEXT ---------- */

  if (state.context !== lastState.context) {
    renderNavBar(state);
    renderDrawer(state);
  }

  /* ---------- PANEL ---------- */

  if (state.panel?.view !== lastState.panel?.view) {
    renderPanel(state);
    renderHub(state);
  }

  /* ---------- CART ---------- */

  if (state.cart?.items !== lastState.cart?.items) {
    renderCartBar(state);
    renderStatusBar(state);
    renderDrawer(state);

    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart.items || []));
  }

  /* ---------- LANGUAGE ---------- */

  if (state.lang?.current !== lastState.lang?.current) {
    localStorage.setItem(CONFIG.LANG_KEY, state.lang.current);
    syncLanguage(state);
  }

  /* ---------- ORDER FLOW ---------- */

  if (
    state.order !== lastState.order ||
    state.context?.active !== lastState.context?.active
  ) {
    await syncOrderFlow(state);
  }

  lastState = structuredClone(state);
}

/* =======================================================
   OVERLAY
======================================================= */

function syncOverlay(state) {
  const nextOverlay = state.overlay?.view;

  if (!nextOverlay) {
    closeOverlay();
    return;
  }

  switch (nextOverlay) {
    case "cartDrawer":
      renderDrawer(state);
      showOverlay("cartDrawer");
      break;

    case "placePicker":
      renderPlacePicker(state);
      showOverlay("placePicker");
      break;

    default:
      break;
  }
}

/* =======================================================
   LANGUAGE
======================================================= */

function syncLanguage(state) {
  const lang = state.lang?.current;
  const langSwitch = document.getElementById("langSwitch");

  if (langSwitch) {
    langSwitch.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.value === lang);
    });
  }

  renderNavBar(state);
  renderCartBar(state);
  renderStatusBar(state);
  renderHub(state);
  renderPanel(state);
  renderDrawer(state);
}

/* =======================================================
   ORDER ORCHESTRATION
======================================================= */

async function syncOrderFlow(state) {
  if (isProcessingOrder) return;

  const orderType = state.order?.type;
  const orderLine = state.order?.line;
  const activePlace = state.context?.active;

  if (!orderType) return;

  /* ---------- ADD TO CART ---------- */
  if (orderType === "cart" && orderLine) {
    isProcessingOrder = true;

    addToCart(orderLine);

    setState({
      order: {
        type: null,
        line: null
      }
    });

    isProcessingOrder = false;
    return;
  }

  /* ---------- BUY NOW ---------- */
  if (orderType === "instant" && orderLine) {
    if (!activePlace?.id) {
      if (state.overlay?.view !== "placePicker") {
        setState({
          overlay: {
            view: "placePicker"
          }
        });
      }
      return;
    }

    isProcessingOrder = true;

    await buyNow(orderLine);

    setState({
      order: {
        type: null,
        line: null
      },
      overlay: {
        view: null
      }
    });

    isProcessingOrder = false;
    return;
  }

  /* ---------- SEND CART ---------- */
  if (orderType === "send_cart") {
    if (!activePlace?.id) {
      if (state.overlay?.view !== "placePicker") {
        setState({
          overlay: {
            view: "placePicker"
          }
        });
      }
      return;
    }

    isProcessingOrder = true;

    await sendCart();

    setState({
      order: {
        type: null,
        line: null
      },
      overlay: {
        view: null
      }
    });

    isProcessingOrder = false;
  }
}

/* =======================================================
   OPTIONAL PLACE RESUME
======================================================= */

export function applySelectedPlace(placeId) {
  if (!placeId) return false;

  const ok = applyPlaceById(placeId);

  if (!ok) return false;

  setState({
    overlay: {
      view: null
    }
  });

  return true;
}