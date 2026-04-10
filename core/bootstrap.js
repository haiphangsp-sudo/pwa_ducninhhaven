// core/bootstrap.js

import { getState, setState } from "./state.js";
import { getCategoriesForCurrentPlace, getVariantById } from "./menuQuery.js";

/* =======================================================
   PUBLIC
======================================================= */

export function bootstrapApp() {
  const state = getState();
  const next = {};

  const nextLang = resolveLang(state);
  if (nextLang !== state.lang?.current) {
    next.lang = { ...(state.lang || {}), current: nextLang };
  }

  const nextContext = resolveContext(state);
  if (!isSameContext(nextContext, state.context)) {
    next.context = {
      ...(state.context || {}),
      ...nextContext
    };
  }

  const nextPanel = resolvePanel({
    ...state,
    context: {
      ...(state.context || {}),
      ...nextContext
    }
  });

  if (!isSamePanel(nextPanel, state.panel)) {
    next.panel = nextPanel;
  }

  const nextCart = resolveCart(state);
  if (!isSameCart(nextCart, state.cart)) {
    next.cart = nextCart;
  }

  if (Object.keys(next).length > 0) {
    setState(next);
  }

  return getState();
}

/* =======================================================
   RESOLVE
======================================================= */

function resolveLang(state) {
  const fromCache = readStorage("haven_lang");
  const current = state.lang?.current;

  return normalizeLang(fromCache || current || "vi");
}

function resolveContext(state) {
  const current = state.context || {};
  const cached = readStorage("haven_context");

  // Có thể mở rộng thêm TTL sau
  if (cached && typeof cached === "object") {
    return {
      ...current,
      current: cached.current || current.current || null
    };
  }

  return current;
}

function resolvePanel(state) {
  const currentView = state.panel?.view || null;
  const currentOption = state.panel?.option || null;

  const categories = getCategoriesForCurrentPlace() || [];
  if (!categories.length) {
    return {
      view: null,
      option: null
    };
  }

  // 1. Ưu tiên panel hiện tại nếu còn hợp lệ
  let view = categories.find(cat => cat.key === currentView)?.key || null;
  let option = currentOption;

  // 2. Nếu panel cũ không còn hợp lệ thì lấy panel đầu tiên hợp lệ
  if (!view || !option) {
    view = categories[0].key;
    option = categories[0].ui;
  }

  return {
    view,
    option
  };
}

function resolveCart(state) {
  const items = state.cart?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ...(state.cart || {}),
      items: []
    };
  }

  // Chỉ giữ lại item còn tồn tại trong menu
  const validItems = items.filter(item => {
    if (!item?.id) return false;
    return !!getVariantById(item.id);
  });

  return {
    ...(state.cart || {}),
    items: validItems
  };
}

/* =======================================================
   HELPERS
======================================================= */

function normalizeLang(lang) {
  return lang === "en" ? "en" : "vi";
}

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isSamePanel(a, b) {
  return (a?.view || null) === (b?.view || null)
      && (a?.option || "cart") === (b?.option || "cart");
}

function isSameContext(a, b) {
  const aId = a?.current?.id || null;
  const aType = a?.current?.type || null;

  const bId = b?.current?.id || null;
  const bType = b?.current?.type || null;

  return aId === bId && aType === bType;
}

function isSameCart(a, b) {
  const aItems = a?.items || [];
  const bItems = b?.items || [];

  if (aItems.length !== bItems.length) return false;

  return aItems.every((item, i) => {
    const other = bItems[i];
    return item?.id === other?.id && item?.qty === other?.qty;
  });
}