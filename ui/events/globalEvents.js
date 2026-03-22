

import { attachCartBarEvents } from "../render/renderCart.js";
import { networkBackEvent } from "../../services/network.js";
import { resetIdleTimer } from "../../core/idle.js";
import { attachMenuEvents } from "../components/categoryOption.js";
import { setDeliveryState } from "../render/renderDelivery.js";
import { setRecoveryState } from "../render/renderRecovery.js";
import { attachPlacePickerEvents } from "../components/placePicker.js";
import { attachHubEvents } from "../render/renderHub.js";
import { attachLanguageEvents, attachNavBarEvents } from "../components/navBar.js";
import { attachDrawerEvents } from "../render/renderDrawer.js";
import { syncContextToState } from "../../core/state.js";
import { attachOrchestrator } from "../../core/events.js";
import { closeOverlay } from "../interactions/backdropManager.js";

export function attachAppEvents() {

    attachNavBarEvents();
    attachMenuEvents();
    attachCartBarEvents();
    attachPlacePickerEvents();
    attachHubEvents();
    attachLanguageEvents();
    networkBackEvent();
    attachDrawerEvents();
    attachOrchestrator();

    setDeliveryState("idle");
    setRecoveryState("idle");

    ["touchstart", "pointerdown", "click"].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    window.addEventListener("contextchange", syncContextToState);
    window.addEventListener("intentresume", () => Orchestrator.resume());
    
    window.addEventListener("keydown", e => {
        if (e.key === "Escape") closeOverlay();
    });
}
