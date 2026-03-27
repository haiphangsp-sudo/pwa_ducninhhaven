// core/menuQuery.js

import { MENU } from "./menuStore.js";
import { getContext } from "./context.js";


function getPlace() {
    const ctx = getContext();
    const anchor=ctx?.anchor;
    if(!anchor) return "table";
    return anchor.type;
}
export function getCategories() {
    const place = getPlace();
    const out = [];
    for (const [key, cat] of Object.entries(MENU)) {
        if (typeof cat!== "object") continue
        if (cat.active === false) continue;
        if (cat.allow&&!cat.allow.includes(place)) continue;
        out.push({
            key,
            label: cat.label,
            ui: cat.ui,
            icon: cat.icon
        });
    
    }
return out;

}
export function getCategory(key) {
    const category = MENU[key];
    if (!category) return null;
    
    const items = Object.entries(category.items || {}).map(([itemKey, item]) => ({
        ...item,
        key: itemKey
    })
    );
    
    return {
        ...category,
        key,
        items
    };
}

export function getItems(catKey) {
    const cat = MENU[catKey];
    if (!cat) return [];
    const out = [];
    for (const [itemKey, item] of Object.entries(cat.items || {})) {
        if (item.active === false) continue;
        out.push({
            key: itemKey,
            label: item.label,
            price: item.price,
            unit: item.unit,
            image: item.image
        });
    }
    return out;
}

export function getOptions(catKey, itemKey) {

  const options = MENU?.[catKey]?.items?.[itemKey]?.options;
  if (!options) return [];

  return Object.entries(options)
    .map(([optKey, opt]) => ({
      ...opt,
      key: optKey
    }))
    .filter(opt => opt.active !== false);
}


export function getArticle(key) {
    const cat = MENU[key];
    if (!cat) return [];
   
    return Object.values(cat.items)
    .filter(item=>item.active!==false)
    
}

/**
 * Tìm kiếm món ăn theo ID
 */

export function getItemById(id) {
  if (!id || !MENU || typeof MENU !== "object") return null;

  for (const [categoryKey, category] of Object.entries(MENU)) {
    if (!category || typeof category !== "object") continue;

    for (const [itemKey, item] of Object.entries(category.items || {})) {
      if (!item || typeof item !== "object") continue;

      // 1) Ưu tiên tìm theo option.id
      for (const [optionKey, option] of Object.entries(item.options || {})) {
        if (!option || typeof option !== "object") continue;

        if (option.id === id) {
          return {
            id: option.id,
            categoryKey,
            itemKey,
            optionKey,

            categoryLabel: category.label,
            itemLabel: item.label,
            optionLabel: option.label,

            itemName: item.label,
            name: option.label,
            fullName: {
              vi: `${item.label?.vi || itemKey} - ${option.label?.vi || optionKey}`,
              en: `${item.label?.en || itemKey} - ${option.label?.en || optionKey}`
            },

            price: Number(option.price || 0),
            unit: option.unit || "item",
            active: option.active !== false,
            ui: category.ui || "cart"
          };
        }
      }

      // 2) Dự phòng: item có id riêng
      if (item.id === id) {
        return {
          id: item.id,
          categoryKey,
          itemKey,
          optionKey: null,

          categoryLabel: category.label,
          itemLabel: item.label,
          optionLabel: null,

          itemName: item.label,
          name: item.label,
          fullName: item.label,

          price: Number(item.price || 0),
          unit: item.unit || "item",
          active: item.active !== false,
          ui: category.ui || "cart"
        };
      }
    }
  }

  return null;
}