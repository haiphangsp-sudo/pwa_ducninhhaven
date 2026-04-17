// core/bootstrap.js

import { getState, setState } from "./state.js";
import { getCategoriesForCurrentPlace, getVariantById } from "./menuQuery.js";
import { CONFIG } from "../config.js";

export function bootstrapApp() {
  const state = getState();

  const nextContext = resolveContext(state);
  const nextState = {
    lang: resolveLangState(state),
    context: nextContext,
    panel: resolvePanelState(state, nextContext),
    cart: resolveCartState(state)
  };

  const patch = {};

  if (!isSameLang(nextState.lang, state.lang)) {
    patch.lang = nextState.lang;
  }

  if (!isSameContext(nextState.context, state.context)) {
    patch.context = nextState.context;
  }

  if (!isSamePanel(nextState.panel, state.panel)) {
    patch.panel = nextState.panel;
  }

  if (!isSameCart(nextState.cart, state.cart)) {
    patch.cart = nextState.cart;
  }

  if (Object.keys(patch).length) {
    setState(patch);
  }

  return getState();
}

/* =========================
   RESOLVERS
========================= */

function resolveLangState(state) {
  return {
    ...(state.lang || {}),
    current: normalizeLang(
      readStorage(CONFIG.LANG_KEY) ||
      state.lang?.current ||
      "vi"
    )
  };
}

function resolveContext(state) {
  const current = state.context || {};
  const cached = readStorage("haven_context");

  return {
    ...current,
    current: cached?.current || current.current || null
  };
}

function resolvePanelState(state, nextContext) {
  const contextState = {
    ...state,
    context: nextContext
  };

  const currentView = state.panel?.view || null;
  const currentOption = state.panel?.option || null;
  const categories = getCategoriesForCurrentPlace(contextState) || [];

  if (!categories.length) {
    return { view: null, option: null };
  }

  const currentMatch = categories.find(cat => cat.key === currentView);

  if (currentMatch && currentOption) {
    return {
      view: currentMatch.key,
      option: currentOption
    };
  }

  return {
    view: categories[0].key,
    option: categories[0].ui
  };
}

function resolveCartState(state) {
  const currentCart = state.cart || {};
  const items = Array.isArray(currentCart.items) ? currentCart.items : [];

  return {
    ...currentCart,
    items: items.filter(item => item?.id && getVariantById(item.id))
  };
}

/* =========================
   HELPERS
========================= */

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeLang(lang) {
  return lang === "en" ? "en" : "vi";
}

function isSameLang(a, b) {
  return (a?.current || "vi") === (b?.current || "vi");
}

function isSamePanel(a, b) {
  return (a?.view || null) === (b?.view || null) &&
         (a?.option || null) === (b?.option || null);
}

function isSameContext(a, b) {
  return (a?.current?.id || null) === (b?.current?.id || null) &&
         (a?.current?.type || null) === (b?.current?.type || null);
}

function isSameCart(a, b) {
  const aItems = a?.items || [];
  const bItems = b?.items || [];

  if (aItems.length !== bItems.length) return false;

  return aItems.every((item, index) => {
    const other = bItems[index];
    return item?.id === other?.id && item?.qty === other?.qty;
  });
}