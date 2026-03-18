// core/context.js

import { CONFIG } from "../config.js";
import { MENU } from "./menuStore.js";
import { PLACES, PLACE_RULES} from "../data/places.js";

/* ---------- CONTEXT STATE ---------- */

const STORAGE_KEY = "app_context";
const TTL = 1000 * 60 * 30; // 30 phút

let context = loadContext();

/* ---------- LOAD / SAVE ---------- */

function loadContext() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyContext();

    const parsed = JSON.parse(raw);

    if (isExpired(parsed)) {
      return createEmptyContext();
    }

    return parsed;
  } catch {
    return createEmptyContext();
  }
}

function saveContext() {
  context.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  dispatchContextChange();
}

function isExpired(ctx) {
  if (!ctx?.updatedAt) return true;
  return Date.now() - ctx.updatedAt > TTL;
}

function createEmptyContext() {
  return {
    anchor: null,
    active: null,
    updatedAt: Date.now()
  };
}

/* ---------- PUBLIC GET ---------- */

export function getContext() {
  return context;
}

/* ---------- CORE SET ---------- */

export function setAnchor(place) {
  context.anchor = place;
  saveContext();
}

export function setActive(place) {
  context.active = place;
  saveContext();
}

/* ---------- PLACE PRIORITY ---------- */

export function canSelectPlace(anchorType, targetType) {
  if (!anchorType || !targetType) return false;
  return PLACE_RULES[anchorType]?.includes(targetType) ?? false;
}

/* ---------- APPLY PLACE ---------- */

export function applyResolvedPlace(resolved) {
  if (!resolved) return false;

  const anchorType = context?.anchor?.type;
  const nextType = resolved.type;

  // luôn cho set active nếu hợp lệ
  if (!anchorType) {
    // lần đầu (QR)
    context.anchor = resolved;
    context.active = resolved;
  } else if (canSelectPlace(anchorType, nextType)) {
    // chỉ đổi active
    context.active = resolved;
  } else {
    return false; // không hợp lệ
  }

  saveContext();
  return true;
}

export function applyPlaceById(placeId) {
  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  return applyResolvedPlace(resolved);
}

export function applyEntryPlace(resolved) {
if (!resolved) return false;

  context.anchor = resolved;
  context.active = resolved;
  saveContext();
  return true;
}

export function applyEntryPlaceById(placeId) {
  if(!placeId) return false;

  const resolved = resolvePlace(placeId);
  if(!resolved) return false;

  return applyEntryPlace(resolved);
  
}
/* ---------- NORMALIZE ---------- */

export function normalizeContext() {
  if (isExpired(context)) {
    context = createEmptyContext();
    saveContext();
    return;
  }

  // refresh TTL
  saveContext();
}

/* ---------- RESOLVE PLACE ---------- */
export function resolvePlace(placeId) {
  const directPlace =
    MENU?.places?.[placeId] ??
    MENU?.place?.[placeId] ??
    CONFIG?.PLACES?.[placeId] ??
    CONFIG?.places?.[placeId];

  if (directPlace) return directPlace;

  if (PLACES.room?.[placeId]) {
    return { type: "room", id: placeId, ...PLACES.room[placeId] };
  }

  if (PLACES.table?.[placeId]) {
    return { type: "table", id: placeId, ...PLACES.table[placeId] };
  }

  if (PLACES.area?.[placeId]) {
    return { type: "area", id: placeId, ...PLACES.area[placeId] };
  }

  return null;
}

/* ---------- EVENTS ---------- */

function dispatchContextChange() {
  window.dispatchEvent(new Event("contextchange"));
}
