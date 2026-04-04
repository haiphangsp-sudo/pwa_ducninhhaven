// core/menuSchema.js

export function normalizeMenu(menu) {
  for (const [categoryKey, category] of Object.entries(menu || {})) {
    if (!category || typeof category !== "object" || Array.isArray(category)) continue;

    if (category.active === undefined) category.active = true;
    if (category.ui === undefined) category.ui = "cart";
    if (category.allow === undefined) category.allow = ["table"];

    // items -> products
    if (category.products === undefined) {
      category.products = category.items || {};
      delete category.items;
    }

    for (const [productKey, product] of Object.entries(category.products || {})) {
      if (!product || typeof product !== "object" || Array.isArray(product)) continue;

      if (!product.id) {
        product.id = `PRODUCT_${categoryKey}_${productKey}`.toUpperCase();
      }

      if (product.active === undefined) product.active = true;

      // article chỉ cần tới level product
      if (category.ui === "article") {
        continue;
      }

      // options -> variants
      if (product.variants === undefined) {
        product.variants = product.options || {};
        delete product.options;
      }

      if (category.ui === "cart" && product.recommend === undefined) {
        product.recommend = Object.keys(product.variants || {}).slice(0, 1);
      }

      for (const [variantKey, variant] of Object.entries(product.variants || {})) {
        if (!variant || typeof variant !== "object" || Array.isArray(variant)) continue;

        if (!variant.id) {
          variant.id = `VARIANT_${categoryKey}_${productKey}_${variantKey}`.toUpperCase();
        }

        if (variant.active === undefined) variant.active = true;

        if (variant.price !== undefined && Number(variant.price) > 0 && !variant.unit) {
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
    if (!category || typeof category !== "object" || Array.isArray(category)) {
      errors.push(`${categoryKey}: invalid category object`);
      continue;
    }

    requireKey(errors, category, "label", categoryKey);
    requireKey(errors, category, "ui", categoryKey);
    requireKey(errors, category, "active", categoryKey);
    requireKey(errors, category, "allow", categoryKey);
    requireKey(errors, category, "products", categoryKey);

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

    if (
      typeof category.products !== "object" ||
      category.products === null ||
      Array.isArray(category.products)
    ) {
      errors.push(`${categoryKey}: products must be object`);
      continue;
    }

    for (const [productKey, product] of Object.entries(category.products || {})) {
      const productPath = `${categoryKey}.${productKey}`;

      if (!product || typeof product !== "object" || Array.isArray(product)) {
        errors.push(`${productPath}: invalid product object`);
        continue;
      }

      requireKey(errors, product, "label", productPath);
      requireKey(errors, product, "active", productPath);

      if (product.id !== undefined && typeof product.id !== "string") {
        errors.push(`${productPath}: id must be string`);
      }

      if (typeof product.active !== "boolean") {
        errors.push(`${productPath}: active must be boolean`);
      }

      if (category.ui === "article") {
        requireKey(errors, product, "content", productPath);

        const hasVariants =
          product.variants &&
          typeof product.variants === "object" &&
          !Array.isArray(product.variants) &&
          Object.keys(product.variants).length > 0;

        if (hasVariants) {
          errors.push(`${productPath}: article product must not have variants`);
        }

        continue;
      }

      requireKey(errors, product, "variants", productPath);

      if (
        typeof product.variants !== "object" ||
        product.variants === null ||
        Array.isArray(product.variants)
      ) {
        errors.push(`${productPath}: variants must be object`);
        continue;
      }

      if (category.ui === "cart") {
        if (product.recommend !== undefined && !Array.isArray(product.recommend)) {
          errors.push(`${productPath}: recommend must be array`);
        }

        for (const r of product.recommend || []) {
          if (!product.variants[r]) {
            errors.push(`${productPath}: invalid recommend: ${r}`);
          }
        }
      }

      for (const [variantKey, variant] of Object.entries(product.variants || {})) {
        const variantPath = `${productPath}.${variantKey}`;

        if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
          errors.push(`${variantPath}: invalid variant object`);
          continue;
        }

        requireKey(errors, variant, "label", variantPath);
        requireKey(errors, variant, "active", variantPath);

        if (variant.id !== undefined && typeof variant.id !== "string") {
          errors.push(`${variantPath}: id must be string`);
        }

        if (variant.price !== undefined && !Number.isFinite(variant.price)) {
          errors.push(`${variantPath}: price must be number`);
        }

        if (variant.unit !== undefined && !validUnits.includes(variant.unit)) {
          errors.push(`${variantPath}: invalid unit`);
        }

        if (typeof variant.active !== "boolean") {
          errors.push(`${variantPath}: active must be boolean`);
        }
      }
    }
  }

  if (errors.length) {
    throw new Error("MENU_SCHEMA_ERROR\n" + errors.join("\n"));
  }

  return true;
}

function requireKey(errors, obj, key, path) {
  if (obj?.[key] === undefined) {
    errors.push(`Missing ${path}.${key}`);
  }
}