// ui/components/navBar.js

import { getAnchorDisplay, getLocationInfo } from "../../core/placesQuery.js";

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
  const currentLang = state.lang.current;
  const {placeName} = getLocationInfo();

  if (refs.identityIcon) refs.identityIcon.textContent = getAnchorDisplay(state).icon;
  if (refs.identityLabel) refs.identityLabel.textContent = getAnchorDisplay(state).label;
  if (refs.locLabel) refs.locLabel.textContent = placeName;

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
