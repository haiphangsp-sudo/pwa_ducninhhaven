

export function normalizeMenu(menu) {
  for (const [catKey, cat] of Object.entries(menu)) {

    // CATEGORY ID
    if (!cat.id) cat.id = `CAT_${catKey}`.toUpperCase();

    if (cat.active === undefined) cat.active = true;
    if (cat.ui === undefined) cat.ui = "cart";
    if (cat.allow === undefined) cat.allow = ["table"];
    if (cat.items === undefined) cat.items = {};

    for (const [itemKey, item] of Object.entries(cat.items || {})) {

      // ITEM ID
      if (!item.id) item.id = `ITEM_${catKey}_${itemKey}`.toUpperCase();

      if (item.active === undefined) item.active = true;
      if (item.options === undefined) item.options = {};

      if (cat.ui === "cart") {
        if (item.recommend === undefined) {
          item.recommend = Object.keys(item.options).slice(0, 1);
        }
      }

      if (cat.ui === "cart" || cat.ui === "instant") {
        for (const [optKey, opt] of Object.entries(item.options || {})) {

          // OPTION ID (quan trọng nhất)
          if (!opt.id) {
            opt.id = `OPT_${catKey}_${itemKey}_${optKey}`.toUpperCase();
          }

          if (opt.active === undefined) opt.active = true;
          if (opt.price > 0 && !opt.unit) opt.unit = "item";
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