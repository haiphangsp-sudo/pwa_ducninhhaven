/* =======================================================
   NORMALIZE
======================================================= */
// core/placesSchema.js hoặc core/placesStore.js

export function normalizePlaceGroups(raw) {
  const out = {};

  for (const [type, group] of Object.entries(raw || {})) {
    const meta = group?.meta || {};
    
    // 1. Kiểm tra nếu toàn bộ Group bị tắt từ Admin (ví dụ: tắt toàn bộ 'table')
    if (meta.active === false) continue;

    const items = Array.isArray(group?.items) ? group.items : [];

    // 2. Lọc danh sách items
    const activeItems = items
      .filter(item => {
        // Chỉ giữ lại những item có ID và không bị Admin đặt active: false
        return item && item.id && item.active !== false;
      })
      .map(item => ({
        id: item.id,
        type,
        // Giữ lại trạng thái active (mặc định true nếu không có)
        active: true, 
        label: item.label || { vi: item.id, en: item.id },
        // Bạn có thể gộp thêm các trường phụ khác từ Admin tại đây
        ...(item.meta || {}) 
      }));

    // 3. Chỉ đưa vào danh sách hiển thị nếu group đó có ít nhất 1 item đang bật
    if (activeItems.length > 0) {
      out[type] = {
        meta: {
          type,
          label: meta.label || { vi: type, en: type },
          icon: meta.icon || "",
          allow: Array.isArray(meta.allow) && meta.allow.length
            ? meta.allow
            : [type]
        },
        items: activeItems
      };
    }
  }

  return out;
}