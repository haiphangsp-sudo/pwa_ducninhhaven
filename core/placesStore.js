// core/placesStore.js
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";
import { normalizePlaceGroups, validatePlaces } from "./placesSchema.js";

/* =======================================================
   LOAD
======================================================= */

export let PLACES = {}; // Dữ liệu đầy đủ (gồm cả mục đã tắt) cho Admin

export async function loadPlaces() {
  const base = await fetch("/data/places.json", { cache: "no-store" }).then(r => r.json());
  
  let adminPatch = {};
  try {
    adminPatch = await fetch("/api/data/places").then(r => r.json());
  } catch { /* ignore */ }

  // 1. Gộp dữ liệu
  const fullData = deepMerge(base, adminPatch);

  // 2. Chuẩn hóa (Normalize)
  const groups = normalizePlaceGroups(fullData);

  try {
    // 3. KIỂM TRA (Validate)
    validatePlaces(groups);

    // 4. Nếu qua cửa, mới tính toán index và cập nhật State
    const index = buildPlaceIndex(groups);
    setState({
      places: {
        data: { groups, index },
        status: "ready",
        updatedAt: Date.now()
      }
    });
  } catch (err) {
    // Nếu dữ liệu Admin làm hỏng cấu trúc, ta báo lỗi và không cập nhật
    console.error("[Haven Check] Lỗi cấu trúc Vị trí:", err.message);
    
    // Hiển thị thông báo cho người dùng/admin nếu cần
    if (typeof showToast === "function") {
      showToast({ type: "error", message: "Dữ liệu Vị trí bị lỗi cấu trúc!" });
    }
  }
}

function buildPlaceIndex(groups) {
  const index = {};
  for (const [type, group] of Object.entries(groups || {})) {
    for (const item of group.items || []) {
      index[item.id] = {
        ...item,
        type
      };
    }
  }
  return index;
}

