/* =======================================================
   NORMALIZE
======================================================= */

export function normalizePlaceGroups(raw) {
  const out = {};

  for (const [type, group] of Object.entries(raw || {})) {
    const meta = group?.meta || {};
    const items = Array.isArray(group?.items) ? group.items : [];

    out[type] = {
      meta: {
        type,
        label: meta.label || { vi: type, en: type },
        icon: meta.icon || "",
        allow: Array.isArray(meta.allow) && meta.allow.length
          ? meta.allow
          : [type]
      },
      items: items
        .filter(item => item && item.id)
        .map(item => ({
            id: item.id,
            active: item.active !== false,
          type,
          label: item.label || { vi: item.id, en: item.id }
        }))
    };
  }

  return out;
}