// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).

import { getContext } from "../core/context.js";
import { resolvePlace } from "../core/placesStore.js";
import { translate } from "../ui/utils/translate.js";
import { getState } from "../core/state.js";


/* =======================================================
   CURRENT PLACE
======================================================= */
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

