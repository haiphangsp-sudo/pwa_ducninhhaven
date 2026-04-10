// ui/renderApp.js

import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";
import { renderCartBar } from "./renderCartBar.js";


export async function renderApp(state) {
    
    renderNavBar(state);
    renderHub(state);
    renderCartBar(state);
}