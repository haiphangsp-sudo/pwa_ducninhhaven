// core/menuQuery.js

import { getContext } from "./context.js";
import { getState } from "./state.js";
import { resolvePlace } from "./placesStore.js";
import { translate } from "../ui/utils/translate.js";

export function getCategory(key) {
  const menuData = getMenuData();
  return menuData[key] || null;
}


export function getVariants(categoryKey, productKey) {
  const menuData = getMenuData();
  const product = menuData[categoryKey].products?.[productKey];
  if (product?.active===false) return [];

  return Object.entries(product.variants || {})
    .filter(([, variant]) => variant.active !== false)
    .map(([key, variant]) => ({
      key,
      ...variant,
      price: variant.price > 0
                ? variant.price.toLocaleString("vi-VN") + " đ"
                : variant.price === 0 ? translate("cart_bar.free")
                : translate("cart_bar.instant"),
      recommend: (product.recommend || []).includes(key)
    }));
}

/**
 * Lấy danh sách sản phẩm trong một Category
 */

export function getProducts(categoryKey) {
  if (!categoryKey) return [];
  
  const menuData = getMenuData();
  const category = menuData[categoryKey];
  
  if (!category || category.active === false) return [];

  const products = category.products || {};

  return Object.entries(products)
    .filter(([, product]) => product?.active !== false)
    .map(([key, product]) => ({
      ...product,
      key
    }));
}

/**
 * TRÍ TRÍ QUAN TRỌNG: Truy tìm thông tin chi tiết từ một ID duy nhất
 * Dùng cho Giỏ hàng và Mua ngay
 */
export function getVariantById(id) {
  const menuData = getMenuData();

  for (const [catKey, cat] of Object.entries(menuData)) {
    const products = cat.products || {};
    
    for (const [prodKey, prod] of Object.entries(products)) {
      const variants = prod.variants || {};
      
      for (const [varKey, variant] of Object.entries(variants)) {
        if (variant.id === id) {
          return {
            id: variant.id,
            categoryKey: catKey,
            productKey: prodKey,
            variantKey: varKey,
            // Đã dịch sẵn để UI chỉ việc hiển thị
            productLabel: translate(prod.label),
            variantLabel: translate(variant.label),
            price: Number(variant.price || 0),
            priceFormat: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price),
            unit: variant.unit,
            ui: cat.ui || "cart"
          };
        }
      }
    }
  }
  return null;
}

/**
 * BIẾN ĐỔI GIỎ HÀNG: Từ mảng {id, qty} thành dữ liệu hiển thị Drawer
 */
export function getDrawerExtended() {
  const state = getState();
  const items = state.cart?.items || [];
  let totalP = 0;
  let totalQ = 0;

  const detailedItems = items.map(cartItem => {
    const info = getVariantById(cartItem.id);
    if (!info) return null;

    const linePrice = info.price * cartItem.qty;
    totalP += linePrice;
    totalQ += cartItem.qty;

    return { 
        ...cartItem, 
        ...info, 
        linePrice,
        linePriceFormat: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(linePrice)
    };
  }).filter(Boolean);

  return {
    items: detailedItems,
    isEmpty: totalQ === 0,
    itemUnique: `${detailedItems.length} ${translate("cart_bar.unique")}`,
    totalQty: totalQ,
    totalQtyFormat: totalQ > 1 ?
      `${totalQ} ${translate("cart_bar.items")}`
      : translate("cart_bar.item"),
    totalPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalP)
  };
}

/* =======================================================
   INTERNAL
======================================================= */

function getCtx() {
  return getContext() || {};
}

function getMenuData() {
  return getState().menu?.data || {};
}

/* =======================================================
   MODE / PLACE
======================================================= */

export function getCurrentPlaceType() {
  const ctx = getCtx();
  return ctx?.active?.type || ctx?.anchor?.type || null;
}

export function getCurrentPlaceId() {
  const ctx = getCtx();
  return ctx?.active?.id || null;
}

export function getAnchorType() {
  return getCtx()?.anchor?.type || null;
}

export function getAnchorId() {
  return getCtx()?.anchor?.id || null;
}

export function hasActivePlace() {
  return !!getCurrentPlaceId();
}

export function getResolvedActivePlace() {
  const placeId = getCurrentPlaceId();
  if (!placeId) return null;
  return resolvePlace(placeId);
}

export function getResolvedAnchorPlace() {
  const anchorId = getAnchorId();
  if (!anchorId) return null;
  return resolvePlace(anchorId);
}

/* =======================================================
   LOCATION INFO
======================================================= */

export function getLocationInfo() {
  const ctx = getCtx();
  const activeId = ctx?.active?.id;
  const mode = getCurrentPlaceType();

  if (!activeId) {
    return {
      hasPlace: false,
      placeId: null,
      placeName: translate("place.select"),
      placeData: null,
      isResolved: false,
      mode
    };
  }

  const placeData = resolvePlace(activeId);

  return {
    hasPlace: true,
    placeId: activeId,
    placeName: placeData?.label ? translate(placeData.label) : activeId,
    placeData: placeData || null,
    isResolved: !!placeData,
    mode
  };
}

/* =======================================================
   PLACE ICON
======================================================= */

const PLACE_ICONS = {
  room: "🛏",
  table: "☕",
  area: "🌿"
};

export function getPlaceIcon() {
  const mode = getCurrentPlaceType();
  return PLACE_ICONS[mode] || "📍";
}

/* =======================================================
   MENU FILTER
======================================================= */

export function getCategoriesForCurrentPlace() {
  const menuData = getMenuData();
  const placeType = getCurrentPlaceType();

  return Object.entries(menuData)
    .filter(([, cat]) => {
      if (!cat || cat.active === false) return false;
      if (!placeType) return true;
      return !cat.allow || cat.allow.includes(placeType);
    })
    .map(([key, cat]) => ({
      key,
      label: cat.label,
      ui: cat.ui,
      icon: cat.icon
    }));
}

export function getCategoriesForMode(mode) {
  const menuData = getMenuData();
  const placeType = mode || null;

  return Object.entries(menuData)
    .filter(([, cat]) => {
      if (!cat || cat.active === false) return false;
      if (!placeType) return true;
      return !cat.allow || cat.allow.includes(placeType);
    })
    .map(([key, cat]) => ({
      key,
      label: cat.label,
      ui: cat.ui,
      icon: cat.icon
    }));
}
