// ui/renderApp.js
// Điểm vào duy nhất để render.

import { renderCartBar } from "./renderCart.js";
import { renderAck } from "./renderOverlay.js";
import { renderNavBar } from "../components/navBar.js";
import { renderHub } from "./renderHub.js";
import { renderDrawer } from "./renderDrawer.js";


export function renderApp(){
  renderNavBar();
  renderHub();
  renderCartBar()
  renderAck();
  renderDrawer();
}

