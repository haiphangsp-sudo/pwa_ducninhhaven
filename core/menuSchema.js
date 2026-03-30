

// core/menuSchema.js

export function normalizeMenu(menu) {
  for (const [categoryKey, category] of Object.entries(menu || {})) {
    if (!category || typeof category !== "object") continue;

    if (category.active === undefined) category.active = true;
    if (category.ui === undefined) category.ui = "cart";
    if (category.allow === undefined) category.allow = ["table"];

    // Chuẩn hóa items -> products
    if (category.products === undefined) {
      category.products = category.items || {};
      delete category.items;
    }

    for (const [productKey, product] of Object.entries(category.products || {})) {
      if (!product || typeof product !== "object") continue;

      if (!product.id) {
        product.id = `PRODUCT_${categoryKey}_${productKey}`.toUpperCase();
      }

      if (product.active === undefined) product.active = true;

      // ARTICLE: chỉ cần tới level product
      if (category.ui === "article") {
        continue;
      }

      // CART / INSTANT: chuẩn hóa options -> variants
      if (product.variants === undefined) {
        product.variants = product.options || {};
        delete product.options;
      }

      if (category.ui === "cart" && product.recommend === undefined) {
        product.recommend = Object.keys(product.variants || {}).slice(0, 1);
      }

      for (const [variantKey, variant] of Object.entries(product.variants || {})) {
        if (!variant || typeof variant !== "object") continue;

        if (!variant.id) {
          variant.id = `VARIANT_${categoryKey}_${productKey}_${variantKey}`.toUpperCase();
        }

        if (variant.active === undefined) variant.active = true;

        if (Number(variant.price) > 0 && !variant.unit) {
          variant.unit = "item";
        }
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
    category.key = categoryKey;
    if (!category || typeof category !== "object") {
      errors.push(`${categoryKey}: invalid category object`);
      continue;
    }

    req(category, "label", categoryKey);
    req(category, "ui", categoryKey);
    req(category, "active", categoryKey);
    req(category, "allow", categoryKey);
    req(category, "products", categoryKey);

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

    if (typeof category.products !== "object" || category.products === null || Array.isArray(category.products)) {
      errors.push(`${categoryKey}: products must be object`);
      continue;
    }

    for (const [productKey, product] of Object.entries(category.products || {})) {
      product.key = productKey;
      if (!product || typeof product !== "object") {
        errors.push(`${categoryKey}.${productKey}: invalid product object`);
        continue;
      }

      req(product, "label", `${categoryKey}.${productKey}`);
      req(product, "active", `${categoryKey}.${productKey}`);

      if (product.id !== undefined && typeof product.id !== "string") {
        errors.push(`${categoryKey}.${productKey}: id must be string`);
      }

      if (typeof product.active !== "boolean") {
        errors.push(`${categoryKey}.${productKey}: active must be boolean`);
      }

      // ARTICLE: chỉ validate content ở level product
      if (category.ui === "article") {
        req(product, "content", `${categoryKey}.${productKey}`);

        if (product.variants !== undefined) {
          const hasVariants =
            typeof product.variants === "object" &&
            product.variants !== null &&
            Object.keys(product.variants).length > 0;

          if (hasVariants) {
            errors.push(`${categoryKey}.${productKey}: article product must not have variants`);
          }
        }

        continue;
      }

      // CART / INSTANT
      req(product, "variants", `${categoryKey}.${productKey}`);

      if (typeof product.variants !== "object" || product.variants === null || Array.isArray(product.variants)) {
        errors.push(`${categoryKey}.${productKey}: variants must be object`);
        continue;
      }

      if (category.ui === "cart") {
        if (product.recommend !== undefined && !Array.isArray(product.recommend)) {
          errors.push(`${categoryKey}.${productKey}: recommend must be array`);
        }

        for (const r of product.recommend || []) {
          if (!product.variants[r]) {
            errors.push(`${categoryKey}.${productKey}: invalid recommend: ${r}`);
          }
        }
      }

      for (const [variantKey, variant] of Object.entries(product.variants || {})) {
        variant.key = variantKey;
        if (!variant || typeof variant !== "object") {
          errors.push(`${categoryKey}.${productKey}.${variantKey}: invalid variant object`);
          continue;
        }

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

  if (errors.length) {
    throw new Error("MENU_SCHEMA_ERROR\n" + errors.join("\n"));
  }
}

function req(obj, key, path) {
  if (obj[key] === undefined) {
    throw new Error(`Missing ${path}.${key}`);
  }
}