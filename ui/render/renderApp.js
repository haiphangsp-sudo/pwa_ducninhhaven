// ui/renderApp.js
// Điểm vào duy nhất để render.

import { renderCartBar } from "./renderCart.js";
import { renderAck } from "./renderOverlay.js";
import { initLangSwitch } from "../utils/translate.js";
import { renderNavBar } from "../components/navBar.js";
import { renderHub } from "./renderHub.js";
import { detectRecovery } from "../../core/queue.js";


export function renderApp(){
  detectRecovery();
  renderNavBar();
  renderHub();
  renderCartBar()
  initLangSwitch();
  renderAck();
  
}

