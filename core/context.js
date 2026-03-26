
import { resolvePlaceFromData,getAllowedPlaceTypes } from "./placesStore.js";
import { CONFIG } from "../config.js"


const TTL = 1000 * 60 * 30;

let context = loadContext();

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

function saveContext(meta = {}) {
  const prev = structuredClone(context);

  context.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(context));

  dispatchContextChange(prev, context, meta);
}

export function dispatchContextChange(prev, next, meta = {}) {
  window.dispatchEvent(new CustomEvent("contextchange", {
    detail: {
      source: meta.source || "unknown",
      reason: meta.reason || null,
      prev,
      next
    }
  }));
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

export function getContext() {
  return context;
}

export function normalizeContext() {
  if (isExpired(context)) {
    context = createEmptyContext();
    saveContext();
  }
}

export function resolvePlaceFromData(placeId) {
  return resolvePlace(placeId);
}

export function canSelectPlace(anchorType, targetType) {
  if (!anchorType || !targetType) return false;
  return getAllowedPlaceTypes(anchorType).includes(targetType);
}

export function applyEntryPlace(resolved, meta = {}) {
  if (!resolved) return false;

  context.anchor = resolved;
  context.active = resolved;
  saveContext({ source: meta.source || "entry", reason: meta.reason || null });
  return true;
}

export function applyEntryPlaceById(placeId, meta = {}) {
  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  return applyEntryPlace(resolved, meta);
}

export function applyResolvedPlace(resolved, meta = {}) {
  if (!resolved) return false;

  const anchorType = context?.anchor?.type;
  const nextType = resolved.type;

  if (!anchorType) {
    context.anchor = resolved;
    context.active = resolved;
    saveContext({ source: meta.source || "picker", reason: meta.reason || null });
    return true;
  }

  if (!canSelectPlace(anchorType, nextType)) {
    return false;
  }

  context.active = resolved;
  saveContext({ source: meta.source || "picker", reason: meta.reason || null });
  return true;
}

export function applyPlaceById(placeId, meta = {}) {
  if (!placeId) return false;

  const resolved = resolvePlace(placeId);
  if (!resolved) return false;

  return applyResolvedPlace(resolved, meta);
}

export function returnToAnchor() {
  if (!context.anchor) return false;

  context.active = context.anchor;
  saveContext();
  return true;
}

export function setAnchor(place) {
  context.anchor = place;
  saveContext();
}

export function setActive(place) {
  context.active = place;
  saveContext();
}