// core/placesStore.js

import { setState, getState } from "./state.js";
import { deepMerge } from "../data/helpers.js";
import { normalizePlaceGroups, validatePlaces } from "./placesSchema.js";

export let PLACES = {}; // Full data cho Admin / Debug

/* =======================================================
   LOAD
======================================================= */

export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" }).then(r => r.json());

  let adminPatch = {};
  try {
    adminPatch = await fetch("/api/data/places", { cache: "no-store" }).then(r => r.json());
  } catch {
    adminPatch = {};
  }

  const fullData = deepMerge(base, adminPatch);
  const groups = normalizePlaceGroups(fullData);

  try {
    validatePlaces(groups);

    const index = buildPlaceIndex(groups);

    PLACES = fullData;

    setState({
      places: {
        data: {
          groups,
          index
        },
        status: "ready",
        updatedAt: Date.now()
      }
    });

    return { groups, index };
  } catch (err) {
    console.error("[Haven Check] Lỗi cấu trúc Vị trí:", err.message);

    setState({
      places: {
        status: "error",
        updatedAt: Date.now()
      },
      error: {
        active: true,
        message: err.message
      }
    });

    return null;
  }
}

/* =======================================================
   BUILDERS
======================================================= */

function buildPlaceIndex(groups) {
  const index = {};

  for (const [type, group] of Object.entries(groups || {})) {
    for (const item of group.items || []) {
      index[item.id] = {
        ...item,
        type
      };
    }
  }

  return index;
}

/* =======================================================
   INTERNAL READERS
======================================================= */

function getPlacesData() {
  return getState().places?.data || { groups: {}, index: {} };
}

/* =======================================================
   RUNTIME READERS
======================================================= */

export function getPlaceGroups() {
  return getPlacesData().groups || {};
}

export function getPlaceIndex() {
  return getPlacesData().index || {};
}

export function getPlaceGroup(type) {
  return getPlaceGroups()?.[type] || null;
}

export function getPlaceItems(type, options = {}) {
  const group = getPlaceGroup(type);
  if (!group) return [];

  const groupActive = group.meta?.active !== false;
  const items = group.items || [];

  if (options.includeInactive) {
    return items;
  }

  if (!groupActive) return [];

  return items.filter(item => item.active !== false);
}

export function resolvePlace(placeId, options = {}) {
  if (!placeId) return null;

  const place = getPlaceIndex()?.[placeId] || null;
  if (!place) return null;

  const group = getPlaceGroup(place.type);
  const groupActive = group?.meta?.active !== false;
  const itemActive = place.active !== false;

  if (options.includeInactive) {
    return place;
  }

  if (!groupActive || !itemActive) {
    return null;
  }

  return place;
}

export function getAllowedPlaceTypes(anchorType) {
  const group = getPlaceGroup(anchorType);
  const allow = group?.meta?.allow;

  return Array.isArray(allow) && allow.length ? allow : [anchorType];
}

export function isPlaceActive(placeId) {
  return !!resolvePlace(placeId);
}

export function getAllPlaces(options = {}) {
  const groups = getPlaceGroups();
  const out = [];

  for (const [type, group] of Object.entries(groups || {})) {
    const items = options.includeInactive
      ? (group.items || [])
      : getPlaceItems(type);

    items.forEach(item => {
      out.push({
        ...item,
        type
      });
    });
  }

  return out;
}