// core/placesStore.js

import { setState, getState } from "./state.js";
import { deepMerge } from "../data/helpers.js";
import { normalizePlaceGroups, validatePlaces } from "./placesSchema.js";

export let PLACES = {}; // Dữ liệu đầy đủ cho Admin / Debug

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
  } catch (err) {
    console.error("[Haven Check] Lỗi cấu trúc Vị trí:", err.message);
  }
}

/* =======================================================
   BUILD
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
   READERS (Runtime đọc từ State)
======================================================= */

function getPlacesData() {
  return getState().places?.data || { groups: {}, index: {} };
}

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
  const items = getPlaceGroup(type)?.items || [];

  if (options.includeInactive) return items;

  return items.filter(item => item.active !== false);
}

export function resolvePlace(placeId, options = {}) {
  const place = getPlaceIndex()?.[placeId] || null;
  if (!place) return null;

  if (options.includeInactive) return place;
  if (place.active === false) return null;

  return place;
}

export function getAllowedPlaceTypes(anchorType) {
  return getPlaceGroup(anchorType)?.meta?.allow || [anchorType];
}

export function isPlaceActive(placeId) {
  const place = getPlaceIndex()?.[placeId];
  return !!place && place.active !== false;
}