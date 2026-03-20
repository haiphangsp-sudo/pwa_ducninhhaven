

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


export function eventsApp() {

    attachNavBarEvents();
    attachMenuEvents();
    attachCartBarEvents();
    attachPlacePickerEvents();
    attachHubEvents();
    attachLanguageEvents();
    networkBackEvent();
    attachDrawerEvents()

    setDeliveryState("idle");
    setRecoveryState("idle");

    ["touchstart", "pointerdown", "click"].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    }
