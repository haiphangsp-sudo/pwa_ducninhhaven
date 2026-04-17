// ui/renderApp.js

import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";
import { renderCartBar } from "./renderCartBar.js";
import { showPanel } from "./renderPanel.js";

export function renderApp(state) {
  renderNavBar(state);
  renderHub(state);
  showPanel(state);
  renderCartBar(state);
}

