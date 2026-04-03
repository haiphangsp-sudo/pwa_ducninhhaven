import { getState, setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";

/* =======================================================
   LOAD
======================================================= */

export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" })
    .then(r => r.json());

  const groups = normalizePlaceGroups(base);
  const index = buildPlaceIndex(groups);

  // flat giữ dữ liệu theo type -> id để tiện tra cứu sâu nếu cần
  let flat = Object.fromEntries(
    Object.entries(groups).map(([type, group]) => [
      type,
      Object.fromEntries(group.items.map(item => [item.id, item]))
    ])
  );

  // Gộp thêm dữ liệu gốc (nếu base có field phụ ngoài normalize)
  flat = deepMerge(flat, base);

  setState({
    places: {
      data: {
        groups,
        index,
        flat
      },
      status: "ready",
      updatedAt: Date.now()
    }
  });
}

/* =======================================================
   NORMALIZE
======================================================= */

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
        allow: Array.isArray(meta.allow) && meta.allow.length
          ? meta.allow
          : [type]
      },
      items: items
        .filter(item => item && item.id)
        .map(item => ({
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

function getPlacesState() {
  return getState().places?.data || {};
}

function getGroups() {
  return getPlacesState().groups || {};
}

function getIndex() {
  return getPlacesState().index || {};
}

function getFlat() {
  return getPlacesState().flat || {};
}

/* =======================================================
   PUBLIC HELPERS
======================================================= */

export function resolvePlace(placeId) {
  if (!placeId) return null;
  return getIndex()[placeId] || null;
}

export function getAllowedPlaceTypes(anchorType) {
  if (!anchorType) return [];
  return getGroups()?.[anchorType]?.meta?.allow || [anchorType];
}

export function getPlaceGroup(type) {
  if (!type) return null;
  return getGroups()?.[type] || null;
}

export function getPlaceItems(type) {
  if (!type) return [];
  return getGroups()?.[type]?.items || [];
}

export function getPlaceMeta(type) {
  if (!type) return null;
  return getGroups()?.[type]?.meta || null;
}

export function getAllPlaceGroups() {
  return getGroups();
}

export function getAllPlacesIndex() {
  return getIndex();
}

export function getAllPlacesFlat() {
  return getFlat();
}

export function hasPlace(placeId) {
  return !!resolvePlace(placeId);
}