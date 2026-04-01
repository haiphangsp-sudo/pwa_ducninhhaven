
import { getState } from "../../core/state";
import { renderHub } from "../../ui/render/renderHub";
import { renderNavBar } from "../../ui/render/renderNavBar";




export function renderApp() {
    const s = getState();

    renderHub(s);
    renderNavBar(s);
}