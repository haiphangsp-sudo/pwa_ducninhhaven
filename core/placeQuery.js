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
  const ctx = getCtx();
  const anchor = ctx?.anchor;
  const activeId = ctx?.active?.id;

  // 1. QUAY LẠI LOGIC CŨ: Mặc định là "table" nếu không có anchor
  const ruleType = anchor?.type || "table"; 
  const allowedTypes = getAllowedPlaceTypes(ruleType);
  const out = [];

  ["room", "area", "table"].forEach(type => {
    if (!allowedTypes.includes(type)) return;

    const group = getPlaceGroup(type);
    if (!group) return;

    let items = [];

    // 2. LOGIC CŨ: Ưu tiên dùng anchor để hiển thị ngay lập tức
    if (type === "room" && anchor?.type === "room") {
      // Nếu tìm thấy trong database thì dùng (để có label xịn), 
      // nếu không thì dùng tạm chính cái anchor từ URL
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
        label: p.label ? translate(p.label) : p.id, // Fallback dùng ID nếu chưa có label
        isActive: activeId === p.id
      }))
    });
  });

  return out;
}