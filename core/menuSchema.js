
export function normalizeMenu(menu) {
  for (const [categoryKey, category] of Object.entries(menu)) {
    if (category.active === undefined) category.active = true;
    if (category.ui === undefined) category.ui = "cart";
    if (category.allow === undefined) category.allow = ["table"];

    if (category.products === undefined) {
      category.products = category.items || {};
      delete category.items;
    }

    for (const [productKey, product] of Object.entries(category.products || {})) {
      if (!product.id) product.id = `PRODUCT_${categoryKey}_${productKey}`.toUpperCase();
      if (product.active === undefined) product.active = true;

      if (product.variants === undefined) {
        product.variants = product.options || {};
        delete product.options;
      }

      if (category.ui === "cart" && product.recommend === undefined) {
        product.recommend = Object.keys(product.variants).slice(0, 1);
      }

      for (const [variantKey, variant] of Object.entries(product.variants || {})) {
        if (!variant.id) {
          variant.id = `VARIANT_${categoryKey}_${productKey}_${variantKey}`.toUpperCase();
        }
        if (variant.active === undefined) variant.active = true;
        if (variant.price > 0 && !variant.unit) variant.unit = "item";
      }
    }
  }

  return menu;
}

export function validateMenu(menu) {
  const errors = [];
  const validAllow = ["room", "table", "area"];
  const validUnits = ["item", "session", "kg", "hour", "person"];
  const validUi = ["article", "cart", "instant"];

  for (const [catKey, cat] of Object.entries(menu)) {
    req(cat, "label", catKey);
    req(cat, "ui", catKey);
    req(cat, "active", catKey);
    req(cat, "items", catKey);
    req(cat, "allow", catKey);

    for (const a of cat.allow) {
      if (!validAllow.includes(a)) errors.push(`Invalid allow: ${a}`);
    }

    if (typeof cat.active !== "boolean") {
      errors.push(`${catKey}: invalid active: active must be boolean`);
    }

    if (!validUi.includes(cat.ui)) {
      errors.push(`${catKey}: invalid ui`);
    }

    for (const [itemKey, item] of Object.entries(cat.items || {})) {
      req(item, "label", `${catKey}.${itemKey}`);
      req(item, "active", `${catKey}.${itemKey}`);

      if (cat.ui === "cart") {
        req(item, "options", `${catKey}.${itemKey}`);
        req(item, "recommend", `${catKey}.${itemKey}`);

        if (!Array.isArray(item.recommend)) {
          errors.push(`${catKey}.${itemKey}: recommend not exists`);
        } else {
          for (const r of item.recommend) {
            if (!item.options?.[r]) {
              errors.push(`${catKey}.${itemKey}: invalid recommend: ${r}`);
            }
          }
        }

        for (const [optKey, opt] of Object.entries(item.options || {})) {
          req(opt, "label", `${catKey}.${itemKey}.${optKey}`);
          req(opt, "active", `${catKey}.${itemKey}.${optKey}`);

          if (opt.unit && !validUnits.includes(opt.unit)) {
            errors.push(`${catKey}.${itemKey}.${optKey}: invalid unit`);
          }
        }
      }

      if (cat.ui === "article") {
        req(item, "content", `${catKey}.${itemKey}`);
      }
    }
  }

  if (errors.length) {
    throw new Error("MENU_SCHEMA_ERROR\n" + errors.join("\n"));
  }
}

function req(obj, key, path) {
  if (obj[key] === undefined) {
    throw new Error(`Missing ${path}.${key}`);
  }
}