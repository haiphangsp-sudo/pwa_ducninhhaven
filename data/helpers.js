// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).

import { MENU } from "../core/menuStore.js";
import { getContext } from "../core/context.js";
import { resolvePlace } from "../core/placesStore.js";
import { translate } from "../ui/utils/translate.js"

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

