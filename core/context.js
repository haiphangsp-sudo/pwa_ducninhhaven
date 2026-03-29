import { resolvePlace, getAllowedPlaceTypes } from "./placesStore.js";
import { CONFIG } from "../../config.js";


/* ---------- CONTEXT STATE ---------- */

const TTL = 1000 * 60 * 30;

let context = loadContext();


/* ---------- READ QR ---------- */
// - Nếu URL có param "place", giải mã và lưu vào context để dùng cho các thao tác sau này (gửi yêu cầu, hiển thị ở nav, ...)

export function applyURLContext() {
  const params = new URLSearchParams(location.search);

  const placeId = params.get("place");
  const modeId = params.get("mode");

  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  const ctx = getContext();

  // CASE 1: có mode => entry gốc mới
  if (modeId) {
    if (resolved.type !== modeId) return false;

    applyEntryPlace(resolved);
    history.replaceState({}, "", location.pathname);
    return true;
  }

  // CASE 2: không có mode
  // chưa có local => khách vãng lai / entry mới
  if (!ctx?.anchor) {
    applyEntryPlace(resolved);
    history.replaceState({}, "", location.pathname);
    return true;
  }

  // đã có local => chỉ đổi active
  const ok = applyResolvedPlace(resolved);
  if (!ok) return false;

  history.replaceState({}, "", location.pathname);
  return true;
}

/* ---------- LOAD / SAVE ---------- */

function loadContext() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!raw) return createEmptyContext();

    const parsed = JSON.parse(raw);
    if (isExpired(parsed)) return createEmptyContext();

    return parsed;
  } catch {
    return createEmptyContext();
  }
}

function saveContext() {
  const prev = structuredClone(context);

  context.updatedAt = Date.now();
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(context));

  dispatchContextChange(prev, context);
}

export function dispatchContextChange(prev, next) {
  window.dispatchEvent(new CustomEvent("contextchange", {detail: {prev,next}}));
}

function createEmptyContext() {
  return {
    anchor: null,
    active: null,
    updatedAt: Date.now()
  };
}

function isExpired(ctx) {
  if (!ctx?.updatedAt) return true;
  return Date.now() - ctx.updatedAt > TTL;
}

/* ---------- GET ---------- */

export function getContext() {
  return context;
}

/* ---------- NORMALIZE ---------- */

export function normalizeContext() {
  if (isExpired(context)) {
    context = createEmptyContext();
    saveContext();
  }
}

/* ---------- RULE ---------- */

export function canSelectPlace(anchorType, targetType) {
  if (!anchorType || !targetType) return false;
  return getAllowedPlaceTypes(anchorType).includes(targetType);
}

/* ---------- ENTRY ---------- */
// dùng cho QR / URL / deep link

export function applyEntryPlace(resolved) {
  if (!resolved) return false;

  context.anchor = resolved;
  context.mode = resolved;
  
  saveContext();
  return true;
}

export function applyResolvedPlace(resolved) {
  if (!resolved) return false;

  const anchorType = context?.anchor?.type;
  const nextType = resolved.type;

  if (!anchorType) {
    context.anchor = resolved;
    context.active = resolved;
    saveContext();
    return true;
  }

  if (!canSelectPlace(anchorType, nextType)) {
    return false;
  }

  context.active = resolved;
  saveContext();
  return true;
}

export function applyPlaceById(placeId) {
  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  return applyResolvedPlace(resolved);
}
/* ---------- RETURN ---------- */

export function returnToAnchor() {
  if (!context.anchor) return false;

  context.mode = context.anchor;
  saveContext();
  return true;
}


/* ---------- OPTIONAL DIRECT SET ---------- */
// chỉ giữ nếu thực sự cần
export function setAnchor(place) {
  context.anchor = place;
  saveContext();
}

export function setActive(mode) {
  context.mode = mode;
  saveContext();
}

