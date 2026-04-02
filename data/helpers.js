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

  
export function getCategoriesForMode(){
  const placeType = getMode();
  const MENUDTATA = getState().menu.data || {};
  return Object.entries(MENUDTATA)

    .filter(([k,v]) =>
      v.active &&
      v.allow?.includes(placeType)
    )

    .map(([k,v])=>({
      key:k,
      ...v
    }));

}
export function getPlaceIcon() {
  const mode = getMode();

  if (mode === "room") return "🛏";
  if (mode === "table") return "☕";
  if (mode === "area") return "🌿";
  return "📍";
}

export function getLocationLabel() {
  const ctx = getContext();
  if (!ctx?.active) {
    return translate("place.select");
  } else {
    const id = ctx.active.id;
    const placeData = resolvePlace(id);
    const placeName = translate(placeData?.label) || id;
    return placeName;
  }
}

export function getUIFlags() {
  const state = getState();
  return {
    state,
    isExpanded: state.orders.isBarExpanded,
    hasPlace: !!state.context?.active?.id,
    isCartEmpty: !(state.cart?.items?.length > 0),
    isSending: state.order?.status === "pending"
  };
}

