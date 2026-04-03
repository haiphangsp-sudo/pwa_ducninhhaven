import { CONFIG } from "../config.js";
import { getState } from "./state.js";

/* =======================================================
   CONTEXT STATE
======================================================= */

const TTL = 1000 * 60 * 30;

let context = loadContext();


function getPlacesState() {
  return getState().places?.data || {};
}

function getGroups() {
  return getPlacesState().groups || {};
}


/* =======================================================
   READ QR / URL
======================================================= */

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

  // QR đầy đủ: place + mode
  if (hasMode) {
    if (resolved.type !== modeId) return false;

    const ok = applyEntryPlace(resolved);
    if (ok) clearURL();
    return ok;
  }

  const ctx = getContext();

  // Chưa có anchor => coi như entry mới
  if (!ctx?.anchor?.id) {
    const ok = applyEntryPlace(resolved);
    if (ok) clearURL();
    return ok;
  }

  // Đã có anchor => chỉ đổi active nếu hợp lệ
  const ok = applyResolvedPlace(resolved);
  if (ok) clearURL();
  return ok;
}

/* =======================================================
   LOAD / SAVE
======================================================= */

function loadContext() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!raw) return createEmptyContext();

    const parsed = JSON.parse(raw);
    const normalized = normalizeStoredContext(parsed);

    if (isExpired(normalized)) return createEmptyContext();

    return normalized;
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
  window.dispatchEvent(
    new CustomEvent("contextchange", {
      detail: { prev, next }
    })
  );
}

function createEmptyContext() {
  return {
    anchor: null, // { id, type }
    active: null, // { id, type }
    updatedAt: Date.now()
  };
}

function isExpired(ctx) {
  if (!ctx?.updatedAt) return true;
  return Date.now() - ctx.updatedAt > TTL;
}

export function resolvePlace(placeId) {
  if (!placeId) return null;
  return getPlacesState().index[placeId] || null;
}

/* =======================================================
   NORMALIZE
======================================================= */

function normalizeStoredContext(raw) {
  if (!raw || typeof raw !== "object") {
    return createEmptyContext();
  }

  return {
    anchor: normalizePlaceRef(raw.anchor),
    active: normalizePlaceRef(raw.active),
    updatedAt: Number(raw.updatedAt) || Date.now()
  };
}

function normalizePlaceRef(place) {
  if (!place?.id) return null;

  return {
    id: place.id,
    type: place.type || resolvePlace(place.id)?.type || null
  };
}

function toPlaceRef(resolved) {
  if (!resolved?.id) return null;

  return {
    id: resolved.id,
    type: resolved.type || null
  };
}

export function normalizeContext() {
  const next = normalizeStoredContext(context);

  if (isExpired(next)) {
    context = createEmptyContext();
    saveContext();
    return;
  }

  context = next;
}

/* =======================================================
   GET
======================================================= */

export function getContext() {
  return context;
}

export function getAnchor() {
  return context?.anchor || null;
}

export function getActivePlace() {
  return context?.active || null;
}

export function getActivePlaceId() {
  return context?.active?.id || null;
}

export function getActivePlaceType() {
  return context?.active?.type || null;
}


export function getAllowedPlaceTypes(anchorType) {
  if (!anchorType) return [];
  return getGroups()?.[anchorType]?.meta?.allow || [anchorType];
}
/* =======================================================
   RULE
======================================================= */

export function canSelectPlace(anchorType, targetType) {
  if (!anchorType || !targetType) return false;
  return getAllowedPlaceTypes(anchorType).includes(targetType);
}

/* =======================================================
   APPLY
======================================================= */

export function applyEntryPlace(resolved) {
  const ref = toPlaceRef(resolved);
  if (!ref) return false;

  context.anchor = ref;
  context.active = ref;

  saveContext();
  return true;
}

export function applyResolvedPlace(resolved) {
  const ref = toPlaceRef(resolved);
  if (!ref) return false;

  const anchorType = context?.anchor?.type;
  const nextType = ref.type;

  if (!anchorType) {
    context.anchor = ref;
    context.active = ref;
    saveContext();
    return true;
  }

  if (!canSelectPlace(anchorType, nextType)) {
    return false;
  }

  context.active = ref;
  saveContext();
  return true;
}

export function applyPlaceById(placeId) {
  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  return applyResolvedPlace(resolved);
}

/* =======================================================
   RETURN
======================================================= */

export function returnToAnchor() {
  if (!context?.anchor?.id) return false;

  context.active = {
    id: context.anchor.id,
    type: context.anchor.type
  };

  saveContext();
  return true;
}

/* =======================================================
   OPTIONAL DIRECT SET
======================================================= */

export function setAnchor(place) {
  const ref = normalizePlaceRef(place);
  if (!ref) return false;

  context.anchor = ref;
  saveContext();
  return true;
}

export function setActive(place) {
  const ref = normalizePlaceRef(place);
  if (!ref) return false;

  context.active = ref;
  saveContext();
  return true;
}