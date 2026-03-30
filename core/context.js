import { resolvePlace, getAllowedPlaceTypes } from "./placesStore.js";
import { CONFIG } from "../config.js";


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

  const clearURL = () => history.replaceState({}, "", location.pathname);

  const validModes = ["room", "area", "table"];
  const hasMode = !!modeId;

  if (hasMode && !validModes.includes(modeId)) return false;

  // Entry mới từ QR đầy đủ
  if (hasMode) {
    if (resolved.type !== modeId) return false;

    const ok = applyEntryPlace(resolved);
    if (ok) clearURL();
    return ok;
  }

  // Không có mode => suy theo context hiện tại
  const ctx = getContext();

  // Chưa có anchor => coi như entry mới
  if (!ctx?.anchor) {
    const ok = applyEntryPlace(resolved);
    if (ok) clearURL();
    return ok;
  }

  // Đã có anchor => chỉ đổi active nếu hợp lệ
  const ok = applyResolvedPlace(resolved);
  if (ok) clearURL();
  return ok;
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
  context.active = resolved;

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

  context.active = context.anchor;
  saveContext();
  return true;
}


/* ---------- OPTIONAL DIRECT SET ---------- */
// chỉ giữ nếu thực sự cần
export function setAnchor(place) {
  context.anchor = place;
  saveContext();
}

export function setActive(active) {
  context.active = active;
  saveContext();
}
export function getAnchor() {
  return context?.anchor || null;
}

export function getActivePlace() {
  return context?.active || null;
}
export function getActivePlaceId() {
  return getContext()?.active?.id || null;
}

export function getActivePlaceType() {
  return getContext()?.active?.type || null;
}