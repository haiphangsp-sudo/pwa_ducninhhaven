// ui/renderApp.js

import { getState } from "../../core/state.js";
import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";
import { syncOrdersWithServer } from "../../core/orders.js";


export async function renderApp() {
    const s = getState();
    
    renderNavBar(s);
    renderHub(s);
    await syncOrdersWithServer()


    attachRuntimeRefresh({
        intervalMs: 60000,
        enableInterval: true
    });
    
}