// ui/components/statusBar.js

import { getState, setState } from "../../core/state.js";
import { renderStatusBar } from "../render/renderStatusBar.js";




/* =========================
   PUBLIC
========================= */


export function toggleStatusBar() {
    const isExpanded = getState().orders.isBarExpanded;
    setState({ orders: { isBarExpanded: !isExpanded } });
    renderStatusBar();
}
