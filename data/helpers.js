// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).

import { MENU } from "../core/menuStore.js";

function getPlaceType() {
    const ctx = getContext();
    const anchor=ctx?.anchor;
    if(!anchor) return "table";
    return anchor.type;
}
export function getCategoriesForMode(){
  const placeType = getPlaceType();
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



