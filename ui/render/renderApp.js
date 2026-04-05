// ui/renderApp.js

import { getState } from "../../core/state.js";
import { renderHub } from "../../ui/render/renderHub.js";
import { renderNavBar } from "../../ui/render/renderNavBar.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";
import { initSmartHeader } from "../../ui/render/renderCartBar.js";




export function renderApp() {
    const s = getState();
    
    renderNavBar(s);
    renderHub(s);
    initSmartHeader();


    attachRuntimeRefresh({
        intervalMs: 60000,
        enableInterval: true
    });
    
    
}