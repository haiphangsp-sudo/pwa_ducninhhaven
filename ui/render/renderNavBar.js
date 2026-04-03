// ui/components/navBar.js

import { translate } from "../utils/translate.js";
import { getContext } from "../../core/context.js";
import { resolvePlace } from "../../core/placesStore.js";
import { getPlaceIcon, getLocationInfo } from "../../data/helpers.js";

const refs = {
  identityIcon: null,
  identityLabel: null,
  locLabel: null,
  langButtons: null
};

export function renderNavBar(state) {
  cacheElements();
  updateNavBar(state);
}

function updateNavBar(state) {
  const ctx = getContext();
  const anchor = ctx?.anchor;
  const currentLang = state.lang.current;
  

  if (refs.identityIcon) refs.identityIcon.textContent = getPlaceIcon(anchor?.type);
  if (refs.identityLabel) refs.identityLabel.textContent = getIdentityLabel(anchor);
  if (refs.locLabel) refs.locLabel.textContent = getLocationInfo().placeName;

  console.log;
  if (refs.langButtons) {
    refs.langButtons.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.value === currentLang);
    });
  }

  if (!document.body.classList.contains(currentLang)) {
    document.body.classList.remove('vi', 'en');
    document.body.classList.add(currentLang);
  }
}
function cacheElements() {
  refs.identityIcon = document.querySelector(".identity-icon");
  refs.identityLabel = document.querySelector(".identity-label");
  refs.locLabel = document.querySelector(".loc-label");
  refs.langButtons = document.getElementById("langSwitch");
  refs.pickerButton = document.getElementById("pickerNav");
}

function getIdentityLabel(anchor) {
  if (!anchor) return "Haven";

  const labels = {
    room: () => translate(anchor.label || resolvePlace(anchor.id)?.label || anchor.id),
    table: () => translate("mode.table_guest"),
    area: () => translate("mode.area_guest")
  };

  return labels[anchor.type]?.() || "Haven";
}

