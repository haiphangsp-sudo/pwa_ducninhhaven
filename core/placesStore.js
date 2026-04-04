// core/placesStore.js
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";

/* =======================================================
   LOAD
======================================================= */

export let PLACES = {};

export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" })
    .then(r => r.json());

  normalizePlaceGroups(base);

  let groups = {};
  try {
    groups = await fetch("/api/data/places", { cache: "no-store" }).then(r => r.json());
  } catch {
    console.warn("Không thể tải trạng thái places từ API");
  }

  PLACES = deepMerge(base, groups); 

  const index = buildPlaceIndex(groups);

  setState({
    places: {
      data: { PLACES, index },
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
