// ui/renderApp.js

import { getState } from "../../core/state.js";
import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";
import { hydrateOrdersFromStorage } from "../../core/orders.js";


export function renderApp() {
    const s = getState();
    
    renderNavBar(s);
    renderHub(s);
    hydrateOrdersFromStorage();
}