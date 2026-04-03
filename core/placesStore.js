// core/placesStore.js
import { getState, setState } from "./state.js";

/* =======================================================
   LOAD
======================================================= */

export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" })
    .then(r => r.json());

  // Chỉ cần tạo groups và index là đủ cho mọi hoạt động truy vấn
  const groups = normalizePlaceGroups(base);
  const index = buildPlaceIndex(groups);

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


/* =======================================================
   PUBLIC HELPERS
======================================================= */

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

// Đã loại bỏ getAllPlacesFlat() ở đây

export function hasPlace(placeId) {
  // Vẫn sử dụng getIndex() để kiểm tra sự tồn tại của vị trí
  return !!getIndex()[placeId];
}