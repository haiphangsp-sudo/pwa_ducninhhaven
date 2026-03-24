// ui/sync.js

import { subscribe, getState } from "../../core/state.js";
import { renderNavBar } from "../render/renderNavBar.js";
import { renderCartBar } from "../render/renderCartBar.js";
import { renderStatusBar } from "../render/renderStatusBar.js";
import { renderHub } from "../render/renderHub.js";
import { renderPanel } from "../render/renderPanel.js";
import { showOverlay } from "../interactions/backdropManager.js";




let lastState = {};

/* =========================
   MAIN SYNC
========================= */

export function attachUI() {
  subscribe(syncUI);
  syncUI(getState());
}

function syncUI(state) {

  /* ---------- OVERLAY ---------- */

  if (state.view.overlay !== lastState.view?.overlay) {
    showOverlay(state.view.overlay);
  }

  /* ---------- NAV ---------- */

  if (state.context !== lastState.context) {
    renderNavBar();
  }

  /* ---------- PANEL ---------- */

  if (state.view.panel !== lastState.view?.panel) {
    renderPanel(state.view.panel);
  }

  /* ---------- CART ---------- */

  if (state.cart !== lastState.cart) {
    renderCartBar();
    renderStatusBar();
  }

  /* ---------- LANGUAGE ---------- */

  if (state.lang?.current !== lastState.lang?.current) {
    syncLanguage(state.lang.current);
  }

  lastState = structuredClone(state);
}

/* =========================
   LANGUAGE
========================= */

function syncLanguage(lang) {
  

  // re-render toàn bộ UI phụ thuộc ngôn ngữ
  renderNavBar();
  renderCartBar();
  renderStatusBar();
  renderHub();
  renderPanel(getState().view.panel);
}
