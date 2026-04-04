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

// core/placesSchema.js

export function validatePlaces(data) {
  const errors = [];
  const idSet = new Set(); // Dùng để kiểm tra trùng lặp ID

  if (!data || typeof data !== "object") {
    throw new Error("PLACES_VALIDATION: Dữ liệu đầu vào không hợp lệ");
  }

  for (const [type, group] of Object.entries(data)) {
    const path = `places.${type}`;

    // 1. Kiểm tra cấu trúc Group
    if (!group.meta) errors.push(`${path}: Thiếu trường 'meta'`);
    if (!Array.isArray(group.items)) errors.push(`${path}: 'items' phải là một mảng`);

    // 2. Kiểm tra Metadata
    const meta = group.meta || {};
    if (meta.label && typeof meta.label.vi !== "string") {
      errors.push(`${path}.meta.label.vi: Phải là chuỗi ký tự`);
    }

    // 3. Kiểm tra từng Item (Phòng/Bàn)
    (group.items || []).forEach((item, index) => {
      const itemPath = `${path}.items[${index}]`;

      // Kiểm tra ID
      if (!item.id) {
        errors.push(`${itemPath}: Thiếu trường 'id'`);
      } else {
        if (idSet.has(item.id)) {
          errors.push(`${itemPath}: ID '${item.id}' bị trùng lặp`);
        }
        idSet.add(item.id);
      }

      // Kiểm tra Label
      if (!item.label || !item.label.vi) {
        errors.push(`${itemPath}: Thiếu nhãn 'label.vi'`);
      }

      // Kiểm tra trạng thái Active (nếu có phải là boolean)
      if (item.active !== undefined && typeof item.active !== "boolean") {
        errors.push(`${itemPath}: 'active' phải là true hoặc false`);
      }
    });
  }

  // Nếu có lỗi, chặn đứng quy trình và báo cáo
  if (errors.length > 0) {
    throw new Error("PLACES_SCHEMA_ERROR\n" + errors.join("\n"));
  }
  
  return true;
}