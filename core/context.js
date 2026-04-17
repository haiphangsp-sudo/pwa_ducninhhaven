import { CONFIG } from "../config.js";
import { getState, setState } from "./state.js";
import { resolvePlace, getAllowedPlaceTypes } from "./placesStore.js";

const TTL_ACTIVE = 1000 * 60 * 30;      // 30 phút
const TTL_ANCHOR = 1000 * 60 * 60 * 48; // 48 giờ

let _ctx = {
  anchor: null,
  active: null
};

/* =======================================================
   READERS
======================================================= */

export function getContext() {
  return getState().context || {
    anchor: null,
    active: null,
    updatedAt: null
  };
}

export function getAnchor() {
  return _ctx?.anchor || null;
}

export function getActivePlace() {
  return _ctx?.active || null;
}

export function getActivePlaceId() {
  return _ctx?.active?.id || null;
}

export function getActivePlaceType() {
  return _ctx?.active?.type || null;
}

/* =======================================================
   INTERNAL HELPERS
======================================================= */

function createEmptyContext() {
  return {
    anchor: null,
    active: null
  };
}

function isExpiredBy(ttl, at) {
  if (!at) return true;
  return Date.now() - at > ttl;
}

function saveContextToStorage() {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(_ctx));
}

function updateThemeColor(type) {
  const themeColors = {
    room: "#2f5d46",
    area: "#4a5d4e",
    table: "#333333"
  };

  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;

  meta.setAttribute("content", themeColors[type] || "#2f5d46");
}

function toRef(place, fallbackAt = Date.now()) {
  if (!place) return null;

  return {
    id: place.id,
    type: place.type,
    at: fallbackAt
  };
}

/* =======================================================
   NORMALIZE / SYNC
======================================================= */

export function normalizeContext() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    _ctx = raw ? JSON.parse(raw) : createEmptyContext();
  } catch {
    _ctx = createEmptyContext();
  }

  if (!_ctx || typeof _ctx !== "object") {
    _ctx = createEmptyContext();
  }

  if (_ctx.active && isExpiredBy(TTL_ACTIVE, _ctx.active.at)) {
    _ctx.active = null;
  }

  if (_ctx.anchor && isExpiredBy(TTL_ANCHOR, _ctx.anchor.at)) {
    _ctx.anchor = null;
  }

  // Nếu anchor hết hạn thì không giữ room active cũ
  if (!_ctx.anchor && _ctx.active && _ctx.active.type === "room") {
    _ctx.active = null;
  }
}

export function syncContextToState() {
  const current = _ctx.active || _ctx.anchor || null;

  setState({
    context: {
      anchor: _ctx.anchor,
      active: _ctx.active,
      updatedAt: current?.at || Date.now()
    }
  });

  saveContextToStorage();
  updateThemeColor(current?.type || "table");
}

/* =======================================================
   RULE
======================================================= */

export function canSelectPlace(anchorType, targetType) {
  if (!anchorType || !targetType) return false;
  return getAllowedPlaceTypes(anchorType).includes(targetType);
}

/* =======================================================
   URL / QR
======================================================= */

export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  const modeId = params.get("mode");

  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) {
    console.warn("[Haven] Không tìm thấy hoặc vị trí đã bị tắt:", placeId);
    return false;
  }

  const validModes = ["room", "area", "table"];
  if (modeId && (!validModes.includes(modeId) || resolved.type !== modeId)) {
    return false;
  }

  const ref = toRef(resolved, Date.now());

  _ctx.anchor = ref;
  _ctx.active = ref;

  history.replaceState({}, "", location.pathname);
  syncContextToState();
  return true;
}

/* =======================================================
   ACTIONS
======================================================= */

export function clearContext() {
  _ctx = createEmptyContext();
  syncContextToState();
  return true;
}

export function returnToAnchor() {
  if (!_ctx.anchor) return false;

  _ctx.active = {
    id: _ctx.anchor.id,
    type: _ctx.anchor.type,
    at: Date.now()
  };

  syncContextToState();
  return true;
}

export function setAnchor(place) {
  if (!place?.id || !place?.type) return false;

  _ctx.anchor = {
    id: place.id,
    type: place.type,
    at: Date.now()
  };

  syncContextToState();
  return true;
}

export function setActive(place) {
  if (!place?.id || !place?.type) return false;

  _ctx.active = {
    id: place.id,
    type: place.type,
    at: Date.now()
  };

  syncContextToState();
  return true;
}

export function applyPlaceById(placeId) {
  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  const anchorType = _ctx.anchor?.type;

  if (anchorType && !canSelectPlace(anchorType, resolved.type)) {
    return false;
  }

  _ctx.active = {
    id: resolved.id,
    type: resolved.type,
    at: Date.now()
  };

  syncContextToState();
  return true;
}

/* =======================================================
   RECONCILE AFTER PLACES REFRESH
======================================================= */

export function reconcileContextAfterPlacesRefresh() {
  const anchorId = _ctx?.anchor?.id || null;
  const activeId = _ctx?.active?.id || null;

  const resolvedAnchor = anchorId ? resolvePlace(anchorId) : null;
  const resolvedActive = activeId ? resolvePlace(activeId) : null;

  if (!resolvedAnchor && !resolvedActive) {
    const hadContext = !!(_ctx.anchor || _ctx.active);
    _ctx = createEmptyContext();

    if (hadContext) {
      syncContextToState();
      return { changed: true, mode: "cleared" };
    }

    return { changed: false, mode: "none" };
  }

  if (resolvedAnchor && !resolvedActive) {
    _ctx.anchor = {
      id: resolvedAnchor.id,
      type: resolvedAnchor.type,
      at: _ctx.anchor?.at || Date.now()
    };

    _ctx.active = {
      id: resolvedAnchor.id,
      type: resolvedAnchor.type,
      at: Date.now()
    };

    syncContextToState();
    return { changed: true, mode: "fallback-anchor" };
  }

  if (!resolvedAnchor && resolvedActive) {
    _ctx.anchor = null;
    _ctx.active = {
      id: resolvedActive.id,
      type: resolvedActive.type,
      at: _ctx.active?.at || Date.now()
    };

    syncContextToState();
    return { changed: false, mode: "keep-active" };
  }

  if (
    resolvedAnchor &&
    resolvedActive &&
    !canSelectPlace(resolvedAnchor.type, resolvedActive.type)
  ) {
    _ctx.anchor = {
      id: resolvedAnchor.id,
      type: resolvedAnchor.type,
      at: _ctx.anchor?.at || Date.now()
    };

    _ctx.active = {
      id: resolvedAnchor.id,
      type: resolvedAnchor.type,
      at: Date.now()
    };

    syncContextToState();
    return { changed: true, mode: "fallback-anchor" };
  }

  _ctx.anchor = {
    id: resolvedAnchor.id,
    type: resolvedAnchor.type,
    at: _ctx.anchor?.at || Date.now()
  };

  _ctx.active = {
    id: resolvedActive.id,
    type: resolvedActive.type,
    at: _ctx.active?.at || Date.now()
  };

  syncContextToState();
  return { changed: false, mode: "ok" };
}