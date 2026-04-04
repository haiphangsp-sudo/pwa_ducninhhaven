// core/menuStore.js

import { validateMenu, normalizeMenu } from "./menuSchema.js";
import { setState, getState } from "./state.js";
import { deepMerge } from "../data/helpers.js";

export let MENU = {}; // Dữ liệu đầy đủ cho Admin / Debug

/* =======================================================
   LOAD
======================================================= */

export async function loadMenu() {
  const base = await fetch("/data/menu.json", { cache: "no-store" }).then(r => r.json());

  let adminPatch = {};
  try {
    adminPatch = await fetch("/api/data/menu", { cache: "no-store" }).then(r => r.json());
  } catch {
    adminPatch = {};
  }

  const fullData = deepMerge(base, adminPatch);

  normalizeMenu(fullData);

  try {
    validateMenu(fullData);

    MENU = fullData;

    setState({
      menu: {
        data: fullData,
        status: "ready",
        updatedAt: Date.now()
      }
    });
  } catch (error) {
    console.error("[Haven Check] Dữ liệu Menu bị lỗi, không thể cập nhật:", error.message);
  }
}

/* =======================================================
   READERS (Runtime đọc từ State)
======================================================= */

export function getMenuData() {
  return getState().menu?.data || {};
}

export function getMenuCategory(categoryKey) {
  return getMenuData()?.[categoryKey] || null;
}

export function getMenuProduct(categoryKey, productKey) {
  return getMenuData()?.[categoryKey]?.products?.[productKey] || null;
}

export function getMenuVariant(categoryKey, productKey, variantKey) {
  return getMenuData()?.[categoryKey]?.products?.[productKey]?.variants?.[variantKey] || null;
}