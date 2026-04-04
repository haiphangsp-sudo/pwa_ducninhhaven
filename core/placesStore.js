import { setState, getState } from "./state.js";
import { normalizePlaceGroups, validatePlaces } from "./placesSchema.js";

export let PLACES = {};
export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" }).then(r => r.json());

  let adminPatch = {};
  try {
    adminPatch = await fetch("/api/data/places", { cache: "no-store" }).then(r => r.json());
  } catch {
    adminPatch = {};
  }

  const fullData = applyPlacesPatch(base, adminPatch);
  const groups = normalizePlaceGroups(fullData);

  try {
    validatePlaces(groups);

    const index = buildPlaceIndex(groups);
    PLACES = fullData;

    setState({
      places: {
        data: { groups, index },
        status: "ready",
        updatedAt: Date.now()
      }
    });

    return { groups, index };
  } catch (err) {
    console.error("[Haven Check] Lỗi cấu trúc Vị trí:", err.message);
    setState({
      places: { status: "error", updatedAt: Date.now() },
      error: { active: true, message: err.message }
    });
    return null;
  }
}

function applyPlacesPatch(base, patch) {
  const out = structuredClone(base || {});

  for (const [type, groupPatch] of Object.entries(patch || {})) {
    if (!out[type]) continue;

    if (groupPatch.meta && typeof groupPatch.meta === "object") {
      out[type].meta = {
        ...(out[type].meta || {}),
        ...groupPatch.meta
      };
    }

    if (groupPatch.itemsById && typeof groupPatch.itemsById === "object") {
      out[type].items = (out[type].items || []).map(item => {
        const itemPatch = groupPatch.itemsById[item.id];
        return itemPatch ? { ...item, ...itemPatch } : item;
      });
    }
  }

  return out;
}

function buildPlaceIndex(groups) {
  const index = {};
  for (const [type, group] of Object.entries(groups || {})) {
    for (const item of group.items || []) {
      index[item.id] = { ...item, type };
    }
  }
  return index;
}