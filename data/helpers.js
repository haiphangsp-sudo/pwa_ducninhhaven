// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).

import { MENU } from "../core/menuStore.js";
import { getContext } from "../core/context.js";
import { resolvePlace } from "../core/placesStore.js";
import { translate } from "../ui/utils/translate.js"

// core/utils.js

export function deepMergeCu(target, source) {
  // 1. Tạo bản sao của target để không làm hỏng dữ liệu gốc
  // Nếu dùng cho setState, 'target' chính là 'state' hiện tại
  const output = Array.isArray(target) ? [...target] : { ...target };

  for (const key in source) {
    const value = source[key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Đệ quy: Nếu thuộc tính là object, ta gộp sâu tiếp
      output[key] = deepMerge(target[key] || {}, value);
    } else {
      // Nếu là giá trị đơn giản (string, number) hoặc mảng, ta gán đè
      output[key] = value;
    }
  }

  return output; // Trả về bản sao đã được gộp
}
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
  return Object.entries(MENU)

    .filter(([k,v]) =>
      v.active &&
      v.allow?.includes(placeType)
    )

    .map(([k,v])=>({
      key:k,
      ...v
    }));

}
export function getPlaceIcon(type) {
  if (type === "room") return "🛏";
  if (type === "table") return "☕";
  if (type === "area") return "🌿";
  return "📍";
}

export function getLocationLabel(ctx) {
  if (!ctx?.active) {
    return translate("place.select");
  } else {
    const { type, id } = ctx.active;
    const anchor = ctx.anchor;
    const placeData = resolvePlace(id);
    const placeName = translate(placeData?.label || id);

    if (type === "room" && anchor?.id === id) {
      return `${translate("place.my_room")} (${placeName})`;
    }

    return placeName;
  }
}

