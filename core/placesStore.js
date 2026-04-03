import { setState } from "./state.js";
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
