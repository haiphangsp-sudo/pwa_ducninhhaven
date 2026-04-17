// core/menuQuery.js

import { getState } from "./state.js";
import { translate } from "../ui/utils/translate.js";
import { formatPrice } from "../ui/utils/formatPrice.js";

/* =======================================================
   PUBLIC
======================================================= */

function getMenuData() {
  return getState().menu?.data || {};
}

function resolvePlaceType(state) {
  return (
    state?.context?.active?.type ||
    state?.context?.anchor?.type ||
    "table"
  );
}

export function getCategory(key) {
  const menuData = getMenuData();
  return menuData[key] || {};
}

export function getVariants(categoryKey, productKey) {
  const menuData = getMenuData();
  const category = menuData?.[categoryKey];
  const product = category?.products?.[productKey];

  if (!product || product.active === false) return [];

  return Object.entries(product.variants || {})
    .filter(([, variant]) => variant.active !== false)
    .map(([key, variant]) => ({
      key,
      ...variant,
      price:
        variant.price > 0
          ? formatPrice(variant.price)
          : variant.price === 0
            ? translate("cart_bar.free")
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
 * Truy tìm thông tin chi tiết từ một ID duy nhất
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
            productLabel: translate(prod.label),
            variantLabel: translate(variant.label),
            objProLab: prod.label,
            objVarLab: variant.label,
            price: Number(variant.price || 0),
            priceFormat: formatPrice(variant.price),
            unit: variant.unit,
            ui: cat.ui || "cart"
          };
        }
      }
    }
  }

  return null;
}

export function getVariantDetailById(id) {
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
            productLabel: translate(prod.label),
            variantLabel: translate(variant.label),
            description: variant.description ? translate(variant.description) : "",
            descriptionLong: variant.description_long ? translate(variant.description_long) : "",
            note: variant.note ? translate(variant.note) : "",
            image: variant.image || prod.image || "",
            price: Number(variant.price || 0),
            priceFormat:
              Number(variant.price) > 0
                ? formatPrice(variant.price)
                : Number(variant.price) === 0
                  ? translate("cart_bar.free")
                  : translate("cart_bar.instant"),
            unit: variant.unit || "",
            ui: cat.ui || "cart"
          };
        }
      }
    }
  }

  return null;
}

/**
 * Biến đổi giỏ hàng: từ mảng {id, qty} thành dữ liệu hiển thị Drawer
 */
export function getDrawerExtended(state = getState()) {
  const items = state.cart?.items || [];
  let totalP = 0;
  let totalQ = 0;

  const detailedItems = items
    .map(cartItem => {
      const info = getVariantById(cartItem.id);
      if (!info) return null;

      const linePrice = info.price * cartItem.qty;
      totalP += linePrice;
      totalQ += cartItem.qty;

      return {
        ...cartItem,
        ...info,
        linePrice,
        linePriceFormat: formatPrice(linePrice)
      };
    })
    .filter(Boolean);

  return {
    items: detailedItems,
    isEmpty: totalQ === 0,
    itemUnique: `${detailedItems.length} ${translate("cart_bar.unique")}`,
    totalQty: totalQ,
    totalQtyFormat:
      totalQ > 1
        ? `${totalQ} ${translate("cart_bar.items")}`
        : `${totalQ} ${translate("cart_bar.item")}`,
    totalPrice: totalP,
    totalPriceFormat: formatPrice(totalP)
  };
}

/* =======================================================
   MENU FILTER
======================================================= */

export function getCategoriesForCurrentPlace(inputState) {
  const menuData = getMenuData();
  const state = inputState || getState();
  const placeType = resolvePlaceType(state);

  return Object.entries(menuData)
    .filter(([, cat]) => {
      if (!cat || cat.active === false) return false;
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