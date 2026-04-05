// ui/renderApp.js

import { getState } from "../../core/state.js";
import { renderHub } from "../../ui/render/renderHub.js";
import { renderNavBar } from "../../ui/render/renderNavBar.js";
import { attachRuntimeRefresh } from "../../core/runtimeRefresh.js";
import { handleScroll } from "../../ui/render/renderCartBar.js";
import { initSmartHeader } from "../../ui/render/renderNavBar.js";



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
            handleScroll();
            initSmartHeader();
        ticking = false;
        });
        ticking = true;
    }
    });
}