
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

  for (const [categoryKey, category] of Object.entries(menu || {})) {
    req(category, "label", categoryKey);
    req(category, "ui", categoryKey);
    req(category, "active", categoryKey);
    req(category, "allow", categoryKey);

    const products = category.products || category.items || {};
    if (typeof products !== "object" || Array.isArray(products)) {
      errors.push(`${categoryKey}: products must be object`);
      continue;
    }

    if (!validUi.includes(category.ui)) {
      errors.push(`${categoryKey}: invalid ui`);
    }

    if (typeof category.active !== "boolean") {
      errors.push(`${categoryKey}: active must be boolean`);
    }

    if (!Array.isArray(category.allow)) {
      errors.push(`${categoryKey}: allow must be array`);
    } else {
      for (const a of category.allow) {
        if (!validAllow.includes(a)) {
          errors.push(`${categoryKey}: invalid allow: ${a}`);
        }
      }
    }

    for (const [productKey, product] of Object.entries(products)) {
      req(product, "label", `${categoryKey}.${productKey}`);
      req(product, "active", `${categoryKey}.${productKey}`);

      const variants = product.variants || product.options || {};

      if (category.ui === "cart" || category.ui === "instant") {
        if (typeof variants !== "object" || Array.isArray(variants)) {
          errors.push(`${categoryKey}.${productKey}: variants must be object`);
          continue;
        }
      }

      if (typeof product.active !== "boolean") {
        errors.push(`${categoryKey}.${productKey}: active must be boolean`);
      }

      if (category.ui === "cart") {
        if (product.recommend !== undefined && !Array.isArray(product.recommend)) {
          errors.push(`${categoryKey}.${productKey}: recommend must be array`);
        }

        for (const r of product.recommend || []) {
          if (!variants[r]) {
            errors.push(`${categoryKey}.${productKey}: invalid recommend: ${r}`);
          }
        }
      }

      if (category.ui === "article") {
        req(product, "content", `${categoryKey}.${productKey}`);
      }

      if (category.ui === "cart" || category.ui === "instant") {
        for (const [variantKey, variant] of Object.entries(variants)) {
          req(variant, "label", `${categoryKey}.${productKey}.${variantKey}`);
          req(variant, "active", `${categoryKey}.${productKey}.${variantKey}`);

          if (variant.id !== undefined && typeof variant.id !== "string") {
            errors.push(`${categoryKey}.${productKey}.${variantKey}: id must be string`);
          }

          if (variant.price !== undefined && !Number.isFinite(variant.price)) {
            errors.push(`${categoryKey}.${productKey}.${variantKey}: price must be number`);
          }

          if (variant.unit && !validUnits.includes(variant.unit)) {
            errors.push(`${categoryKey}.${productKey}.${variantKey}: invalid unit`);
          }

          if (typeof variant.active !== "boolean") {
            errors.push(`${categoryKey}.${productKey}.${variantKey}: active must be boolean`);
          }
        }
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