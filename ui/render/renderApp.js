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
import { loadCart } from "../../core/events.js";
import { detectRecovery } from "../../core/queue.js";



export function renderApp(){
  loadCart();
  detectRecovery();
  attachMenuEvents();
  renderNavBar();
  renderHub();
  renderCartBar()
  initLangSwitch();
  renderAck();
  
  // UI hệ thống (không phụ thuộc view)
  
  setDeliveryState("idle");
  setRecoveryState("idle");
}

