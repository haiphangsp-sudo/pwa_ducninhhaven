import { resolvePlace, getAllowedPlaceTypes } from "./placesStore.js";
import { CONFIG } from "../../config.js";


/* ---------- CONTEXT STATE ---------- */

const TTL = 1000 * 60 * 30;

let context = loadContext();

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

export function applyEntryPlaceById({ mode, place }) {
  if (!place) return false;

  const resolved = resolvePlace(place);
  if (!resolved) return false;

  // CASE 1: URL có mode => reset anchor mới
  if (mode) {
    if (resolved.type !== mode) return false;

    applyEntryPlace(resolved); // anchor = active = resolved
    return true;
  }

  // CASE 2: URL không có mode
  const ctx = getContext();

  // chưa có local => mặc định khách vãng lai
  if (!ctx?.anchor) {
    applyEntryPlace(resolved); // anchor = active = T1
    return true;
  }

  // đã có local => đổi active theo quyền anchor
  return applyResolvedPlace(resolved);
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

export function syncContextToState() {
  const ctx = getContext();
  if (!ctx) return;
  setState({
    context: {
      anchor: ctx?.anchor|| null,
      mode: ctx?.mode|| null
    }
  });

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

