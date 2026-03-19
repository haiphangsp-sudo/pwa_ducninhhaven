// ui/components/navBar.js

import { translate } from "../utils/translate.js";
import { getContext } from "../../core/context.js";
import { PLACES } from "../../core/placesStore.js";
import { openPicker } from "./placePicker.js";
import { getState, setState } from "../../core/state.js";
import { getPlaceIcon } from "../../data/helpers.js";


/* =========================
   CACHE
========================= */

let identityIconEl = null;
let identityLabelEl = null;
let locLabelEl = null;

let navEventsAttached = false;
let languageEventsAttached = false;

/* =========================
   RENDER
========================= */

export function renderNavBar() {
  cacheNavElements();
  updateNavBar();
  updateLanguageActive();
}

/* =========================
   UPDATE
========================= */

export function updateNavBar() {
  if (!identityIconEl || !identityLabelEl || !locLabelEl) return;

  const ctx = getContext();
  const anchor = ctx?.anchor;

  identityIconEl.textContent = getPlaceIcon(anchor?.type);
  identityLabelEl.textContent = getIdentityLabel(anchor);
  locLabelEl.textContent = getLocationLabel(ctx);
}

function updateLanguageActive() {
  const currentLang = getState().lang.current;

  document.querySelectorAll("#langSwitch button").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.lang === currentLang);
  });
}

/* =========================
   EVENTS
========================= */

export function attachNavBarEvents() {
  if (navEventsAttached) return;
  navEventsAttached = true;

  document.addEventListener("click", handleNavClick);
  window.addEventListener("contextchange", updateNavBar);
}

export function attachLanguageEvents() {
  if (languageEventsAttached) return;
  languageEventsAttached = true;

  document.addEventListener("click", handleLanguageClick);
}

/* =========================
   HANDLERS
========================= */

function handleNavClick(e) {
  const btn = e.target.closest(".nav-center button");
  if (!btn) return;

  openPicker();
}

function handleLanguageClick(e) {
  const btn = e.target.closest("#langSwitch button");
  if (!btn || btn.classList.contains("is-active")) return;

  const lang = normalizeLanguage(btn.dataset.lang);
  const current = getState().lang.current;

  if (lang === current) return;

  localStorage.setItem("haven_lang", lang);
  setState({
    lang: {
      current: lang
    }
  });

  updateLanguageActive();
}

/* =========================
   HELPERS
========================= */

function cacheNavElements() {
  identityIconEl = document.querySelector(".identity-icon");
  identityLabelEl = document.querySelector(".identity-label");
  locLabelEl = document.querySelector(".loc-label");
}

function normalizeLanguage(lang) {
  return lang === "en" ? "en" : "vi";
}

function getIdentityLabel(anchor) {
  if (!anchor) return translate("haven");

  if (anchor.type === "room") {
    const place = PLACES.room?.[anchor.id];
    return translate(place?.label || anchor.id);
  }

  if (anchor.type === "table") {
    return translate("table_guest");
  }

  if (anchor.type === "area") {
    return translate("area_guest");
  }

  return translate("haven");
}

function getLocationLabel(ctx) {
  if (!ctx?.active) {
    return translate("select_place");
  }

  const { type, id } = ctx.active;
  const place = PLACES[type]?.[id];

  if (
    ctx.active.type === "room" &&
    ctx.anchor?.type === "room" &&
    ctx.active.id === ctx.anchor.id
  ) {
    return translate("in_room");
  }

  if (!place) return id;
  return translate(place.label);
}