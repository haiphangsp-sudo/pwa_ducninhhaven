

import { attachCartBarEvents } from "../render/renderCart.js";
import { networkBackEvent } from "../../services/network.js";
import { resetIdleTimer } from "../../core/idle.js";
import { attachMenuEvents } from "../components/categoryOption.js";
import { setDeliveryState } from "../render/renderDelivery.js";
import { setRecoveryState } from "../render/renderRecovery.js";
import { attachPlacePickerEvents } from "../components/placePicker.js";
import { attachHubEvents } from "../render/renderHub.js";
import { attachLangguegeEvents, attachNarBarEvents } from "../components/navBar.js";



export function eventsApp() {
    attachNarBarEvents();
    attachMenuEvents();
    attachCartBarEvents();
    attachPlacePickerEvents();
    attachHubEvents();
    attachLangguegeEvents();

    networkBackEvent();

    setDeliveryState("idle");
    setRecoveryState("idle");
    ["touchstart", "pointerdown", "click"].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });
}