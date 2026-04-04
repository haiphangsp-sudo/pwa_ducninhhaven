// core/placesStore.js
import { setState } from "./state.js";

/* =======================================================
   LOAD
======================================================= */

export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" })
    .then(r => r.json());

  // 1. Tạo khung chuẩn trước
  let groups = normalizePlaceGroups(base);

  // 2. Gộp bù dữ liệu gốc vào để lấy các field phụ (ví dụ: description, capacity...)
  groups = deepMerge(groups, base); 

  // 3. Sau đó mới build index từ bản đã gộp đầy đủ
  const index = buildPlaceIndex(groups);

  setState({
    places: {
      data: { groups, index },
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
