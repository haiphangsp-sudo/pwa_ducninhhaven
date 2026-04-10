// ui/renderApp.js

import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";


export async function renderApp(state) {
    
    renderNavBar(state);
    renderHub(state);
}