// core/placesStore.js
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";
import { normalizePlaceGroups } from "./placesSchema.js";

/* =======================================================
   LOAD
======================================================= */

export let PLACES = {}; // Dữ liệu đầy đủ (gồm cả mục đã tắt) cho Admin

export async function loadPlaces() {
  // 1. Tải dữ liệu cấu trúc gốc
  const base = await fetch("/data/places.json", { cache: "no-store" })
    .then(r => r.json());

  // 2. Tải các thay đổi từ Admin (trạng thái active/inactive)
  let adminPatch = {};
  try {
    adminPatch = await fetch("/api/data/places", { cache: "no-store" }).then(r => r.json());
  } catch {
    console.warn("Không thể tải trạng thái places từ API");
  }

  // 3. Gộp dữ liệu: Admin Patch đè lên Base JSON
  // PLACES sẽ chứa mọi thứ để trang Admin có thể hiển thị checkbox
  PLACES = deepMerge(base, adminPatch); 

  // 4. CHỐT CHẶN: Normalize để lọc bỏ các mục Admin đã tắt (active: false)
  // Đây là dữ liệu thực tế sẽ hiển thị cho khách
  const activeGroups = normalizePlaceGroups(PLACES);

  // 5. Build index từ dữ liệu đã được lọc
  const index = buildPlaceIndex(activeGroups);

  setState({
    places: {
      data: { 
        groups: activeGroups, // Dùng mảng đã lọc cho UI
        index 
      },
      status: "ready",
      updatedAt: Date.now()
    }
  });
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

