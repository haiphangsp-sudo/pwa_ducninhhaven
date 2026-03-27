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
// core/menuQuery.js

export function getItemById(id) {
  if (!id || !MENU) return null;

  for (const cat in MENU) {
    // Kiểm tra an toàn: Nếu items không phải mảng thì bỏ qua category này
    const items = MENU[cat]?.items;
    if (!Array.isArray(items)) continue; 

    for (const item of items) {
      if (item.id === id) return item;

      // Kiểm tra trong các tùy chọn (variants)
      if (Array.isArray(item.variants)) {
        const variant = item.variants.find(v => v.id === id);
        if (variant) {
          return {
            ...variant,
            parentName: item.name // Trả về kèm tên món chính
          };
        }
      }
    }
  }
  return null;
}