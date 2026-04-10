// ui/renderApp.js

import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";


export async function renderApp(state) {
    const s = getState();
    
    renderNavBar(state);
    renderHub(state);
}