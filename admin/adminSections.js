// admin/adminSections.js

import { MENU } from "../core/menuStore.js";
import { PLACES } from "../core/placesStore.js";

import { loadMenu } from "../core/menuStore.js";
import { loadPlaces } from "../core/placesStore.js";

import { saveMenuState, savePlacesState } from "./adminActions.js";

/* ======================================================
   BUILD NODES
====================================================== */

function buildMenuNodes(menu) {
  return Object.entries(menu || {}).map(([catKey, cat]) => ({
    kind: "menu",
    variant: "group-header",
    label: cat?.label?.vi || catKey,
    path: `${catKey}.active`,
    checked: cat?.active !== false,
    children: Object.entries(cat?.products || {}).map(([productKey, product]) => ({
      kind: "menu",
      variant: cat?.ui === "article" ? "simple-item" : "item-with-children",
      label: product?.label?.vi || productKey,
      path: `${catKey}.products.${productKey}.active`,
      checked: product?.active !== false,
      children:
        cat?.ui === "article"
          ? []
          : Object.entries(product?.variants || {}).map(([variantKey, variant]) => ({
              kind: "menu",
              variant: "simple-item",
              label: variant?.label?.vi || variantKey,
              path: `${catKey}.products.${productKey}.variants.${variantKey}.active`,
              checked: variant?.active !== false,
              children: []
            }))
    }))
  }));
}

function buildPlaceNodes(places) {
  return Object.entries(places || {}).map(([typeKey, group]) => ({
    kind: "place",
    variant: "group-header",
    icon: group?.meta?.icon || "",
    label: group?.meta?.label?.vi || typeKey,
    path: `${typeKey}.meta.active`,
    checked: group?.meta?.active !== false,
    children: (group?.items || []).map(item => ({
      kind: "place",
      variant: "simple-item",
      label: item?.label?.vi || item?.id || "",
      meta: `(${item?.id})`,
      path: `${typeKey}.itemsById.${item.id}.active`,
      checked: item?.active !== false,
      children: []
    }))
  }));
}

/* ======================================================
   CONFIG
====================================================== */

export const ADMIN_SECTIONS = {
  menu: {
    rootId: "adminMenu",
    getData: () => MENU,
    buildNodes: buildMenuNodes,
    save: saveMenuState,
    reload: loadMenu
  },
  place: {
    rootId: "adminPlaces",
    getData: () => PLACES,
    buildNodes: buildPlaceNodes,
    save: savePlacesState,
    reload: loadPlaces
  }
};