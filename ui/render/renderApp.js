// ui/renderApp.js
// Điểm vào duy nhất để render.

import { renderCartBar } from "./renderCart.js";
import { renderAck } from "./renderOverlay.js";
import { renderNavBar, updateNavContext } from "../components/navBar.js";
import { renderHub } from "./renderHub.js";


export function renderApp(){
  
  renderNavBar();
  renderHub();
  renderCartBar()
  renderAck();
  updateNavContext();

}

