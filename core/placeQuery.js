import { getState } from "./state.js";
import { getContext } from "./context.js";
import { translate } from "../ui/utils/translate.js";

/* =======================================================
   INTERNAL
======================================================= */

function getPlacesData() {
  return getState().places?.data || {};
}

function getGroups() {
  return getPlacesData().groups || {};
}

function getIndex() {
  return getPlacesData().index || {};
}

function getCtx() {
  return getContext() || {};
}

/* =======================================================
   BASIC RESOLVE
======================================================= */

export function resolvePlace(placeId) {
  if (!placeId) return null;
  return getIndex()[placeId] || null;
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
   RULE
======================================================= */

export function getAllowedPlaceTypes(anchorType) {
  if (!anchorType) return [];

  const group = getGroups()[anchorType];
  return group?.meta?.allow || [anchorType];
}

/* =======================================================
   GROUP / ITEMS
======================================================= */

export function getPlaceGroup(type) {
  return getGroups()?.[type] || null;
}

export function getPlaceItems(type) {
  return getGroups()?.[type]?.items || [];
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
      placeName: translate("place.select"),
      placeData: null,
      mode
    };
  }

  const placeData = resolvePlace(activeId);

  return {
    hasPlace: true,
    placeId: activeId,
    placeName: placeData?.label
      ? translate(placeData.label)
      : activeId,
    placeData: placeData || null,
    mode
  };
}

export function getLocationLabel() {
  return getLocationInfo().placeName;
}

/* =======================================================
   ICON
======================================================= */

const PLACE_ICONS = {
  room: "🛏",
  table: "☕",
  area: "🌿"
};

export function getPlaceIcon() {
  const mode = getCurrentPlaceType();
  return PLACE_ICONS[mode] || "📍";
}

/* =======================================================
   PICKER (QUAN TRỌNG NHẤT)
======================================================= */
export function getPickerGroups() {
  const ctx = getContext() || {};
  const anchor = ctx.anchor || null;
  const activeId = ctx.active?.id || null;
  const ruleType = anchor?.type || null;

  const allowedTypes = ruleType
    ? getAllowedPlaceTypes(ruleType)
    : ["table"];

  const order = ["room", "area", "table"];

  return order
    .filter(type => allowedTypes.includes(type))
    .map(type => {
      const group = getPlaceGroup(type);
      if (!group) return null;

      const meta = group.meta || {};
      let items = [];

      if (type === "room" && anchor?.type === "room" && anchor?.id) {
        const room = resolvePlace(anchor.id);
        if (room) items = [room];
      } else {
        items = getPlaceItems(type) || [];
      }

      if (!items.length) return null;

      return {
        type,
        title: meta.label ? translate(meta.label) : type,
        icon: meta.icon || "",
        items: items.map(place => ({
          id: place.id,
          label: translate(place.label),
          isActive: activeId === place.id
        }))
      };
    })
    .filter(Boolean);
}