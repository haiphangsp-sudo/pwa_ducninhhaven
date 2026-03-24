// ui/components/navBar.js

import { translate } from "../utils/translate.js";
import { getContext } from "../../core/context.js";
import { resolvePlace } from "../../core/placesStore.js";
import { getState } from "../../core/state.js";
import { getPlaceIcon } from "../../data/helpers.js";

const refs = {
  identityIcon: null,
  identityLabel: null,
  locLabel: null
};

export function renderNavBar() {
  cacheElements();
  updateNavBar();

  const currentLang = getState().lang.current;
  refs.langButtons?.forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.lang === currentLang);
  });
}

export function updateNavBar() {
  const ctx = getContext();
  const anchor = ctx?.anchor;

  if (refs.identityIcon) refs.identityIcon.textContent = getPlaceIcon(anchor?.type);
  if (refs.identityLabel) refs.identityLabel.textContent = getIdentityLabel(anchor);
  if (refs.locLabel) refs.locLabel.textContent = getLocationLabel(ctx);
}

function cacheElements() {
  refs.identityIcon = document.querySelector(".identity-icon");
  refs.identityLabel = document.querySelector(".identity-label");
  refs.locLabel = document.querySelector(".loc-label");
  refs.langButtons = document.querySelectorAll("#langSwitch button");
  refs.pickerButton = document.getElementById("pickerNav");
}

function getIdentityLabel(anchor) {
  if (!anchor) return translate("haven");

  const labels = {
    room: () => translate(anchor.label || resolvePlace(anchor.id)?.label || anchor.id),
    table: () => translate("mode.table_guest"),
    area: () => translate("mode.area_guest")
  };

  return labels[anchor.type]?.() || translate("haven");
}

function getLocationLabel(ctx) {
  if (!ctx?.active) return translate("place.select");

  const { type, id } = ctx.active;
  const anchor = ctx.anchor;
  const placeData = resolvePlace(id);
  const placeName = translate(placeData?.label || id);

  if (type === "room" && anchor?.id === id) {
    return `${translate("place.my_room")} (${placeName})`;
  }

  return placeName;
}