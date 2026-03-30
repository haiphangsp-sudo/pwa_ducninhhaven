// core/menuQuery.js

import { MENU } from "./menuStore.js";
import { getContext } from "./context.js";
import { translate } from "../ui/utils/translate.js";
import { getState } from "../../core/state.js";


function getPlace() {
    const ctx = getContext();
    const anchor=ctx?.anchor;
    if(!anchor) return "table";
    return anchor.type;
}
export function getCategory(key) {
  return MENU[key] || null;
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

export function getProductsOLd(categoryKey) {
  if (!categoryKey) return [];
  const category = MENU[categoryKey];
  if (category?.active === false) return [];

  const products = category.products || category.items || {};

  return Object.entries(products)
    .filter(([, product]) => product?.active !== false)
    .map(([key, product]) => ({
      ...product,
      key
    }));
}

export function getProducts(categoryKey) {
  const menuData = getState().menu.data;
  const category = menuData[categoryKey];
  if (!category || category.active === false) return [];
  const products = category.products || category.items || {};

  return Object.entries(products)
    .filter(([, product]) => product?.active !== false)
    .map(([key, product]) => ({
      ...product,
      key
    }));
}


export function getVariants(categoryKey, productKey) {
  const product = MENU[categoryKey]?.products?.[productKey];
  if (product?.active===false) return [];

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
            categoryLabel: translate(category.label),
            productLabel: translate(product.label),
            variantLabel: translate(variant.label),
            price: Number(variant.price || 0),
            priceFormat: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price),
            unit: variant.unit || "item",
            active: variant.active !== false,
            ui: category.ui || "cart"
          };
        }
      }
    }
  }

  return null
}

/**
 * Biến đổi giỏ hàng thô thành dữ liệu chi tiết để hiển thị
 */
export function getCartExtended(state) {
  const items = state.cart?.items || [];
  let totalP = 0;
  let totalQ = 0;

  const detailedItems = items.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const linePrice = info.price * cartItem.qty;
    totalP += linePrice;
    totalQ += cartItem.qty;

    return { ...cartItem, ...info, linePrice };
  }).filter(Boolean);

  return {
    items: detailedItems,
    itemUnique:`${detailedItems.length} ${translate("cart_bar.unique")}`,
    totalPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalP),
    totalQty:totalQ > 1
      ? `${totalQ} ${translate("cart_bar.items")}`
      : `${totalQ} ${translate("cart_bar.item")}`,
    isEmpty: detailedItems.length === 0
  };
}