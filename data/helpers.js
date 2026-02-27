// data/helpers.js
//Hàm đọc menu theo mode (lọc hiển thị).
import { MENU } from "./menu.js";

export function getCategoriesForMode(mode){

  return Object.entries(MENU)
    .filter(([k,v])=>v.modes.includes(mode))
    .map(([k,v])=>({key:k,...v}));

}

export function getItems(category){

  const cat = MENU[category];
  if(!cat) return [];

  return Object.entries(cat.items)
    .filter(([k,v])=>v.active)
    .map(([k,v])=>({key:k,...v}));

}

export function getCategoryType(category){
  return MENU[category]?.type || "instant";
}