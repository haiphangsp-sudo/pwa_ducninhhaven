// core/placesQuery.js

import { getContext } from "./context.js";
import {
  resolvePlace,
  getAllowedPlaceTypes,
  getPlaceGroup,
  getPlaceItems
} from "./placesStore.js";
import { translate } from "../ui/utils/translate.js";

/* =======================================================
   INTERNAL
======================================================= */

function getCtx() {
  return getContext() || {};
}

/* =======================================================
   MODE / TYPE
======================================================= */

export function getCurrentPlaceType() {
  const ctx = getCtx();
  return ctx?.active?.type || ctx?.anchor?.type || null;
}

export function getCurrentPlaceId() {
  return getCtx()?.active?.id || null; 
}

export function getAnchorType() {
  return getCtx()?.anchor?.type || null;
}

export function getAnchorId() {
  return getCtx()?.anchor?.id || null;
}

/* =======================================================
   LOCATION INFO
======================================================= */

export function getLocationInfo() {
  const ctx = getCtx();
  const activeId = ctx?.active?.id;
  const mode = getCurrentPlaceType();

  if (!activeId) {
    return {
      hasPlace: false,
      placeId: null,
      placeName: translate("place.button_nav"),
      placeData: null,
      mode
    };
  }

  const placeData = resolvePlace(activeId);

  return {
    hasPlace: !!placeData,
    placeId: placeData?.id || null,
    placeName: placeData?.label ? translate(placeData.label) : activeId,
    placeData: placeData || null,
    mode
  };
}

/* =======================================================
   ICON
======================================================= */

export function getAnchorDisplay(state) {
  const anchor = state.context?.anchor;
  const index = state.places?.data?.index || {};
  const groups = state.places?.data?.groups || {};

  if (!anchor) return { icon: "📍", label: "Guest" };

  const item = index[anchor.id];
  if (!item) return { icon: "📍", label: "..." };

  const icon = item.icon || groups[item.type]?.meta?.icon || "📍";

  return {
    icon,
    label: translate(item.label)
  };
}

/* =======================================================
   PICKER
======================================================= */

export function getPickerGroups() {
  const ctx = getCtx();
  const anchor = ctx?.anchor;
  const activeId = ctx?.active?.id;

  const ruleType = anchor?.type || "table";
  const allowedTypes = getAllowedPlaceTypes(ruleType);

  const out = [];

  ["room", "area", "table"].forEach(type => {
    if (!allowedTypes.includes(type)) return;

    const group = getPlaceGroup(type);
    if (!group) return;

    let items = [];
    if (type === "room" && anchor?.type === "room") {
      const room = resolvePlace(anchor.id);
      items = room ? [room] : [];
    } else {
      items = getPlaceItems(type);
    }

    if (!items.length) return;

    out.push({
      type,
      title: group.meta?.label ? translate(group.meta.label) : type,
      icon: group.meta?.icon || "",
      items: items.map(p => ({
        id: p.id,
        label: p.label ? translate(p.label) : p.id,
        isActive: activeId === p.id
      }))
    });
  });

  return out;
}