// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).

import { getContext } from "../core/context.js";
import { resolvePlace } from "../core/placesStore.js";
import { translate } from "../ui/utils/translate.js";
import { getState } from "../core/state.js";



/**
 * Hàm gộp sâu Bất biến: Trả về một Object hoàn toàn mới
 */
export function deepMerge(target, source) {
  // Nếu source không phải object, lấy source
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    return source;
  }

  // Tạo bản sao của target
  const output = Array.isArray(target) ? [...target] : { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = output[key];

      if (typeof sourceValue === "object" && sourceValue !== null && !Array.isArray(sourceValue)) {
        output[key] = deepMerge(targetValue || {}, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    }
  }
  return output;
}
function getMode() {
    const ctx = getContext();
    const anchor=ctx?.anchor;
    if(!anchor) return "table";
    return anchor.type;
}

  
export function getCategoriesForMode() {
  const ctx = getContext();
  const placeType = ctx?.active?.type || ctx?.anchor?.type || null;
  const menuData = getState().menu.data || {};

  return Object.entries(menuData)
    .filter(([, v]) => {
      if (!v || v.active === false) return false;
      if (!placeType) return true;
      return !v.allow || v.allow.includes(placeType);
    })
    .map(([key, v]) => ({
      key,
      ...v
    }));
}

export function getLocationInfo() {
  const ctx = getContext();

  const activeId = ctx?.active?.id;
  const anchor = ctx?.anchor;
  const mode = ctx?.mode || anchor?.type || null;

  if (!activeId) {
    return {
      hasPlace: false,
      placeId: null,
      placeName: translate("place.select"),
      placeData: null,
      isResolved: false,
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
    isResolved: !!placeData,
    mode
  };
}

export function getUIFlags() {
  const state = getState();
  return {
    state,
    isExpanded: state.orders.isBarExpanded,
    hasPlace: !!state.context?.active?.id,
    isCartEmpty: !(state.cart?.items?.length > 0),
    isSending: state.order?.status === "sending"
  };
}

