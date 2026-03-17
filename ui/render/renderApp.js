// ui/renderApp.js
// Điểm vào duy nhất để render.

import { renderCartBar ,loadCart} from "./renderCart.js";
import { renderAck } from "./renderOverlay.js";
import { setDeliveryState } from "./renderDelivery.js";
import { setRecoveryState } from "./renderRecovery.js";
import { initLangSwitch } from "../utils/translate.js";
import { renderNavBar } from "../components/navBar.js";
import { renderHub } from "./renderHub.js";
import { attachMenuEvents } from "./renderMenu.js";



export function renderApp(){

  renderNavBar();
  renderHub();
  renderCartBar()
  initLangSwitch();
  renderAck();
  attachMenuEvents()

  // UI hệ thống (không phụ thuộc view)
  //loadCart();
  setDeliveryState("idle");
  setRecoveryState("idle");
}

