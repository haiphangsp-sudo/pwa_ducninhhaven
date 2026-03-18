// core/context.js

import { CONFIG } from "../config.js";
import { MENU } from "./menuStore.js";
import { PLACES } from "../data/places.js";

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

export const PLACE_PRIORITY = {
  area: 1,
  table: 2,
  room: 3
};

export function getPlacePriority(type) {
  return PLACE_PRIORITY[type] ?? 0;
}

export function shouldReplaceAnchor(currentType, nextType) {
  if (!nextType) return false;
  if (!currentType) return true;

  return getPlacePriority(nextType) > getPlacePriority(currentType);
}

/* ---------- APPLY PLACE ---------- */

export function applyResolvedPlace(resolved) {
  if (!resolved) return false;

  const currentType = context?.anchor?.type;
  const nextType = resolved.type;

  // luôn set active
  context.active = resolved;

  // chỉ set anchor khi đủ điều kiện
  if (shouldReplaceAnchor(currentType, nextType)) {
    context.anchor = resolved;
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
