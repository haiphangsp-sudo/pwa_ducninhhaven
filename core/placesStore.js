// core/placesStore.js
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";

export let PLACE_GROUPS = {};
export let PLACE_INDEX = {};
export let PLACES = {};


export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" }).then(r => r.json());

  PLACE_GROUPS = normalizePlaceGroups(base);
  PLACE_INDEX = buildPlaceIndex(PLACE_GROUPS);

  PLACES = Object.fromEntries(
    Object.entries(PLACE_GROUPS).map(([type, group]) => [
      type,
      Object.fromEntries(group.items.map(item => [item.id, item]))
    ])
  );
  PLACES = deepMerge(PLACES, base);

  setState({ 
    places: { 
      data: PLACES, 
      status: "ready",
      updatedAt: Date.now() 
    }
  });
}

function normalizePlaceGroups(raw) {
  const out = {};

  for (const [type, group] of Object.entries(raw || {})) {
    const meta = group?.meta || {};
    const items = Array.isArray(group?.items) ? group.items : [];

    out[type] = {
      meta: {
        type,
        label: meta.label || { vi: type, en: type },
        icon: meta.icon || "",
        allow: Array.isArray(meta.allow) ? meta.allow : [type]
      },
      items: items.map(item => ({
        id: item.id,
        type,
        label: item.label || { vi: item.id, en: item.id }
      }))
    };
  }

  return out;
}

function buildPlaceIndex(groups) {
  const index = {};

  for (const [type, group] of Object.entries(groups)) {
    for (const item of group.items) {
      index[item.id] = {
        ...item,
        type
      };
    }
  }

  return index;
}

export function resolvePlace(placeId) {
  return PLACE_INDEX[placeId] || null;
}

export function getAllowedPlaceTypes(anchorType) {
  return PLACE_GROUPS?.[anchorType]?.meta?.allow || [anchorType];
}

export function getPlaceGroup(type) {
  return PLACE_GROUPS[type] || null;
}

export function getPlaceItems(type) {
  return PLACE_GROUPS?.[type]?.items || [];
}