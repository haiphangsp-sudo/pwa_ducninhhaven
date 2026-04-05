// core/context.js
import { CONFIG } from "../config.js";
import { getState, setState } from "./state.js";
import { resolvePlace, getAllowedPlaceTypes } from "./placesStore.js";

const TTL_ACTIVE = 1000 * 60 * 30;
const TTL_ANCHOR = 1000 * 60 * 60 * 48;

let _ctx = { anchor: null, active: null };

export function getContext() {
  return getState().context || {
    anchor: null,
    active: null,
    current: { id: null, type: "table", isGuest: true },
    updatedAt: null
  };
}
export function clearContext() {
  _ctx = { anchor: null, active: null };
  syncContextToState();
}

export function reconcileContextAfterPlacesRefresh() {
  const anchorId = _ctx?.anchor?.id || null;
  const activeId = _ctx?.active?.id || null;

  const resolvedAnchor = anchorId ? resolvePlace(anchorId) : null;
  const resolvedActive = activeId ? resolvePlace(activeId) : null;

  // 1. Không còn gì hợp lệ
  if (!resolvedAnchor && !resolvedActive) {
    const hadContext = !!(_ctx.anchor || _ctx.active);
    _ctx = { anchor: null, active: null };

    if (hadContext) {
      syncContextToState();
      return { changed: true, mode: "cleared" };
    }

    return { changed: false, mode: "none" };
  }

  // 2. Anchor còn, active mất => fallback về anchor
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

  // 3. Guest đang chọn active, không có anchor => giữ active nếu còn hợp lệ
  if (!resolvedAnchor && resolvedActive) {
    _ctx.anchor = null;
    _ctx.active = {
      id: resolvedActive.id,
      type: resolvedActive.type,
      at: _ctx.active?.at || Date.now()
    };

    syncContextToState();
    return { changed: true, mode: "keep-active" };
  }

  // 4. Cả hai còn hợp lệ => chỉ đồng bộ lại type nếu cần
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
export function normalizeContext() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    _ctx = raw ? JSON.parse(raw) : { anchor: null, active: null };
  } catch {
    _ctx = { anchor: null, active: null };
  }

  const now = Date.now();

  if (_ctx.active?.at && now - _ctx.active.at > TTL_ACTIVE) _ctx.active = null;
  if (_ctx.anchor?.at && now - _ctx.anchor.at > TTL_ANCHOR) _ctx.anchor = null;
}

export function applyURLContext() {
  const params = new URLSearchParams(location.search);
  const placeId = params.get("place");
  const modeId = params.get("mode");

  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  const validModes = ["room", "area", "table"];
  if (modeId && (!validModes.includes(modeId) || resolved.type !== modeId)) {
    return false;
  }

  const ref = { id: resolved.id, type: resolved.type, at: Date.now() };

  _ctx.anchor = ref;
  _ctx.active = ref;

  history.replaceState({}, "", location.pathname);
  syncContextToState();
  return true;
}

export function syncContextToState() {
  const current = _ctx.active || _ctx.anchor;

  setState({
    context: {
      anchor: _ctx.anchor,
      active: _ctx.active,
      current: {
        id: current?.id || null,
        type: current?.type || "table",
        isGuest: !_ctx.anchor
      },
      updatedAt: Date.now()
    }
  });

  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(_ctx));

  const themeColors = {
    room: "#2f5d46",
    area: "#4a5d4e",
    table: "#333333"
  };

  const currentType = current?.type || "table";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", themeColors[currentType] || "#2f5d46");
  }
}

export function applyPlaceById(placeId) {
  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  const anchorType = _ctx.anchor?.type;
  if (anchorType) {
    const allowed = getAllowedPlaceTypes(anchorType);
    if (!allowed.includes(resolved.type)) return false;
  }

  _ctx.active = {
    id: resolved.id,
    type: resolved.type,
    at: Date.now()
  };

  syncContextToState();
  return true;
}