// core/menuStore.js

import { validateMenu, normalizeMenu } from "./menuSchema.js";
import { setState, getState } from "./state.js";
import { deepMerge } from "../data/helpers.js";

export let MENU = {}; // Full data cho Admin / Debug

/* =======================================================
   LOAD
======================================================= */

export async function loadMenu() {
  try {
    // 1. Load base
    const base = await fetch("/data/menu.json", { cache: "no-store" }).then(r => r.json());

    // 2. Chuẩn hóa base trước khi merge patch
    normalizeMenu(base);

    // 3. Load admin patch
    let adminPatch = {};
    try {
      adminPatch = await fetch("/api/data/menu", { cache: "no-store" }).then(r => r.json());
    } catch {
      adminPatch = {};
    }

    // 4. Merge patch vào cây đã chuẩn hóa
    const fullData = deepMerge(structuredClone(base), adminPatch);

    // 5. Validate sau cùng
    validateMenu(fullData);

    // 6. Commit
    MENU = fullData;

    setState({
      menu: {
        data: fullData,
        status: "ready",
        updatedAt: Date.now()
      }
    });

    return fullData;

  } catch (error) {
    console.error("[Haven Check] Dữ liệu Menu bị lỗi, không thể cập nhật:", error.message);

    setState({
      menu: {
        status: "error",
        updatedAt: Date.now()
      },
      error: {
        active: true,
        message: error.message
      }
    });

    return null;
  }
}

/* =======================================================
   RUNTIME READERS
======================================================= */

export function getMenuData() {
  return getState().menu?.data || {};
}

export function getMenuCategory(categoryKey) {
  return getMenuData()?.[categoryKey] || null;
}

export function getMenuCategories(options = {}) {
  const data = getMenuData();
  const entries = Object.entries(data || {});

  if (options.includeInactive) {
    return entries.map(([key, value]) => ({
      key,
      ...value
    }));
  }

  return entries
    .filter(([, value]) => value?.active !== false)
    .map(([key, value]) => ({
      key,
      ...value
    }));
}

export function getMenuProduct(categoryKey, productKey) {
  return getMenuData()?.[categoryKey]?.products?.[productKey] || null;
}

export function getMenuProducts(categoryKey, options = {}) {
  const products = getMenuData()?.[categoryKey]?.products || {};
  const entries = Object.entries(products);

  if (options.includeInactive) {
    return entries.map(([key, value]) => ({
      key,
      ...value
    }));
  }

  return entries
    .filter(([, value]) => value?.active !== false)
    .map(([key, value]) => ({
      key,
      ...value
    }));
}

export function getMenuVariant(categoryKey, productKey, variantKey) {
  return getMenuData()?.[categoryKey]?.products?.[productKey]?.variants?.[variantKey] || null;
}

export function getMenuVariants(categoryKey, productKey, options = {}) {
  const variants = getMenuData()?.[categoryKey]?.products?.[productKey]?.variants || {};
  const entries = Object.entries(variants);

  if (options.includeInactive) {
    return entries.map(([key, value]) => ({
      key,
      ...value
    }));
  }

  return entries
    .filter(([, value]) => value?.active !== false)
    .map(([key, value]) => ({
      key,
      ...value
    }));
}

/* =======================================================
   LOOKUP
======================================================= */

export function findVariantById(id, options = {}) {
  if (!id) return null;

  const menu = getMenuData();

  for (const [categoryKey, category] of Object.entries(menu || {})) {
    if (!options.includeInactive && category?.active === false) continue;

    for (const [productKey, product] of Object.entries(category?.products || {})) {
      if (!options.includeInactive && product?.active === false) continue;

      for (const [variantKey, variant] of Object.entries(product?.variants || {})) {
        if (!options.includeInactive && variant?.active === false) continue;

        if (variant?.id === id) {
          return {
            categoryKey,
            productKey,
            variantKey,
            category,
            product,
            variant
          };
        }
      }
    }
  }

  return null;
}