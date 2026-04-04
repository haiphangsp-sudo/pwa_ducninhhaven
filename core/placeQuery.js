import { getState } from "./state.js";
import { getContext } from "./context.js";
import { translate } from "../ui/utils/translate.js";

/* =======================================================
   INTERNAL
======================================================= */

function getCtx() {
  return getContext() || {};
}

function getPlacesData() {
  return getState().places?.data || {};
}

function getGroups() {
  return getPlacesData().groups || {};
}

function getIndex() {
  return getPlacesData().index || {};
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

/* =======================================================
   ICON
======================================================= */


export function getAnchorDisplay(state) {
  const anchor = state.context?.anchor;
  const index = state.places?.data?.index || {};
  const groups = state.places?.data?.groups || {};

  // 1. Nếu không có anchor (Khách vãng lai)
  if (!anchor) return { icon: "📍", label: "Guest" };

  const item = index[anchor.id];
  if (!item) return { icon: "📍", label: "..." };

  // 2. Lấy icon: Ưu tiên icon của chính item -> sau đó đến icon của nhóm (room/area)
  const icon = item.icon || groups[item.type]?.meta?.icon || "📍";

  return {
    icon,
    label: translate(item.label)
  };
}

/* =======================================================
   PICKER (QUAN TRỌNG NHẤT)
======================================================= */

export function getPickerGroups() {
  const ctx = getCtx();
  const anchor = ctx?.anchor;
  const activeId = ctx?.active?.id;

  // SỬA: Mặc định là "table" nếu không có anchor để tránh hiện tất cả
  const ruleType = anchor?.type || "table"; 
  const allowedTypes = getAllowedPlaceTypes(ruleType);

  const out = [];

  ["room", "area", "table"].forEach(type => {
    if (!allowedTypes.includes(type)) return;

    const group = getPlaceGroup(type);
    if (!group) return;

    let items = [];
    if (type === "room" && anchor?.type === "room") {
      // SỬA: Dự phòng dùng luôn anchor nếu resolve chưa ra dữ liệu
      items = [resolvePlace(anchor.id) || anchor]; 
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
        label: p.label ? translate(p.label) : p.id, // Fallback nếu chưa có label
        isActive: activeId === p.id
      }))
    });
  });

  return out;
}