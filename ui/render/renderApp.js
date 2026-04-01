
import { getState } from "../../core/state.js";
import { renderHub } from "../../ui/render/renderHub.js";
import { renderNavBar } from "../../ui/render/renderNavBar.js";




export function renderApp() {
    const s = getState();
    
    renderNavBar(s);
    renderHub(s);
    
}