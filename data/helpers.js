// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).

import { MENU } from "../core/menuStore.js";


export function getCategoriesForMode(mode){

  return Object.entries(MENU)

    .filter(([k,v]) =>
      v.active &&
      v.allow?.includes(mode)
    )

    .map(([k,v])=>({
      key:k,
      ...v
    }));

}



export function getItems(category){

  const cat = MENU[category];
  if(!cat) return [];

  return Object.entries(cat.items || {})

    .filter(([k,v]) => v.active)

    .map(([k,v])=>({
      key:k,
      ...v
    }));

}



export function getCategoryType(category){

  return MENU[category]?.ui || "instant";

}



export function getOptions(category,item){

  const i = MENU[category]?.items?.[item];

  if(!i || !i.options) return [];

  return Object.entries(i.options)

    .filter(([k,v])=>v.active)

    .map(([k,v])=>({
      key:k,
      ...v
    }));

}



export function getDefaultOption(category,item){

  return MENU[category]?.items?.[item]?.defaultOption || null;

}

export function getPrice(category,item,option){

  return MENU[category]
    ?.items?.[item]
    ?.options?.[option]
    ?.price || 0;

}