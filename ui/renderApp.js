// ui/renderApp.js
// Điểm vào duy nhất để render.

import { renderCartBar } from "./renderCart.js";
import { renderAck } from "./renderAck.js";
import { renderDelivery } from "./renderDelivery.js";
import { renderRecovery } from "./renderRecovery.js";
import { initLangSwitch } from "./langController.js";
import { renderNavBar } from "./components/navBar.js";
import { renderHub } from "./renderHub.js";

export function renderApp(){

  renderNavBar();
  renderHub();
  renderCartBar();
  initLangSwitch();

  // UI hệ thống (không phụ thuộc view)
  renderAck();
  renderDelivery();
  renderRecovery();
}

