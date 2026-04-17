// ui/renderApp.js

import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";
import { renderCartBar } from "./renderCartBar.js";
import { renderPanel } from "./renderPanel.js";


export async function renderApp(state) {
    
    renderNavBar(state);
    renderHub(state);
    renderPanel(state);
    renderCartBar(state);

}