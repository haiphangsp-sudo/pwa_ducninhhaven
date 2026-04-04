// core/placesSchema.js

/* =======================================================
   NORMALIZE
======================================================= */

export function normalizePlaceGroups(raw) {
  const out = {};

  for (const [type, group] of Object.entries(raw || {})) {
    if (!group || typeof group !== "object" || Array.isArray(group)) continue;

    const meta = group.meta || {};
    const items = Array.isArray(group.items) ? group.items : [];

    out[type] = {
      meta: {
        type,
        label: meta.label || { vi: type, en: type },
        icon: meta.icon || "",
        allow:
          Array.isArray(meta.allow) && meta.allow.length
            ? meta.allow
            : [type],
        active: meta.active !== false
      },

      items: items
        .filter(item => item && typeof item === "object" && item.id)
        .map(item => ({
          id: item.id,
          type,
          label: item.label || { vi: item.id, en: item.id },
          active: item.active !== false,
          ...(item.meta && typeof item.meta === "object" ? item.meta : {})
        }))
    };
  }

  return out;
}

/* =======================================================
   VALIDATE
======================================================= */

export function validatePlaces(data) {
  const errors = [];
  const idSet = new Set();
  const validTypes = ["room", "area", "table"];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("PLACES_SCHEMA_ERROR\ninvalid places root");
  }

  for (const [type, group] of Object.entries(data)) {
    const path = `places.${type}`;

    if (!validTypes.includes(type)) {
      errors.push(`${path}: invalid group type`);
    }

    if (!group || typeof group !== "object" || Array.isArray(group)) {
      errors.push(`${path}: invalid group object`);
      continue;
    }

    if (!group.meta || typeof group.meta !== "object" || Array.isArray(group.meta)) {
      errors.push(`${path}: missing meta`);
    }

    if (!Array.isArray(group.items)) {
      errors.push(`${path}: items must be array`);
      continue;
    }

    const meta = group.meta || {};

    if (!meta.label || typeof meta.label !== "object") {
      errors.push(`${path}.meta.label: invalid`);
    } else {
      if (typeof meta.label.vi !== "string") errors.push(`${path}.meta.label.vi: must be string`);
      if (meta.label.en !== undefined && typeof meta.label.en !== "string") {
        errors.push(`${path}.meta.label.en: must be string`);
      }
    }

    if (meta.icon !== undefined && typeof meta.icon !== "string") {
      errors.push(`${path}.meta.icon: must be string`);
    }

    if (meta.active !== undefined && typeof meta.active !== "boolean") {
      errors.push(`${path}.meta.active: must be boolean`);
    }

    if (!Array.isArray(meta.allow)) {
      errors.push(`${path}.meta.allow: must be array`);
    } else {
      meta.allow.forEach((allowType, idx) => {
        if (!validTypes.includes(allowType)) {
          errors.push(`${path}.meta.allow[${idx}]: invalid type '${allowType}'`);
        }
      });
    }

    group.items.forEach((item, index) => {
      const itemPath = `${path}.items[${index}]`;

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        errors.push(`${itemPath}: invalid item object`);
        return;
      }

      if (!item.id || typeof item.id !== "string") {
        errors.push(`${itemPath}.id: required string`);
      } else {
        const normalizedId = item.id.trim();
        if (idSet.has(normalizedId)) {
          errors.push(`${itemPath}.id: duplicate '${normalizedId}'`);
        }
        idSet.add(normalizedId);
      }

      if (!item.label || typeof item.label !== "object") {
        errors.push(`${itemPath}.label: invalid`);
      } else {
        if (typeof item.label.vi !== "string") {
          errors.push(`${itemPath}.label.vi: must be string`);
        }
        if (item.label.en !== undefined && typeof item.label.en !== "string") {
          errors.push(`${itemPath}.label.en: must be string`);
        }
      }

      if (item.active !== undefined && typeof item.active !== "boolean") {
        errors.push(`${itemPath}.active: must be boolean`);
      }

      if (item.type !== undefined && item.type !== type) {
        errors.push(`${itemPath}.type: must match group type '${type}'`);
      }
    });
  }

  if (errors.length) {
    throw new Error("PLACES_SCHEMA_ERROR\n" + errors.join("\n"));
  }

  return true;
}