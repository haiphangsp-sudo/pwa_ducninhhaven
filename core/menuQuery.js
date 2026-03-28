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
export function getProducts(categoryKey) {
  const category = MENU[categoryKey];
  if (!category?.active) return [];

  return Object.entries(category.products || {})
    .filter(([, product]) => product.active !== false)
    .map(([key, product]) => ({
      key,
      ...product
    }));
}

export function getArticle(articleKey) {
    const cat = MENU[articleKey];
    if (!cat) return [];
   
    return Object.values(cat.products)
    .filter(product=>product.active!==false)
    
}


export function getVariants(categoryKey, productKey) {
  const product = MENU[categoryKey]?.products?.[productKey];
  if (!product?.active) return [];

  return Object.entries(product.variants || {})
    .filter(([, variant]) => variant.active !== false)
    .map(([key, variant]) => ({
      key,
      ...variant,
      recommend: (product.recommend || []).includes(key)
    }));
}

/**
 * Tìm kiếm món ăn theo ID
 */
export function getVariantById(id) {
  if (!id) return null;

  for (const [categoryKey, category] of Object.entries(MENU)) {
    for (const [productKey, product] of Object.entries(category.products || {})) {
      for (const [variantKey, variant] of Object.entries(product.variants || {})) {
        if (variant.id === id) {
          return {
            id: variant.id,
            categoryKey,
            productKey,
            variantKey,
            categoryLabel: category.label,
            productLabel: product.label,
            variantLabel: variant.label,
            price: Number(variant.price || 0),
            unit: variant.unit || "item",
            active: variant.active !== false,
            ui: category.ui || "cart"
          };
        }
      }
    }
  }

  return null;
}