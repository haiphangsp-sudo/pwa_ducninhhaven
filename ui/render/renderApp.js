// ui/renderApp.js

import { getState } from "../../core/state.js";
import { renderHub } from "./renderHub.js";
import { renderNavBar } from "./renderNavBar.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";
import { applyScrollUI } from "../events/scrollBehavior.js";


export function renderApp() {
    const s = getState();
    
    renderNavBar(s);
    renderHub(s);


    attachRuntimeRefresh({
        intervalMs: 60000,
        enableInterval: true
    });
    
    
    let ticking = false;
    window.addEventListener("scroll", () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            applyScrollUI();
        ticking = false;
        });
        ticking = true;
    }
    });
}