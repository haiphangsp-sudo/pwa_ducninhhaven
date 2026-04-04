
import { validateMenu, normalizeMenu } from "./menuSchema.js";
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";


export let MENU = {}; // Biến chứa TOÀN BỘ thực đơn (cho Admin)

export async function loadMenu() {
  // 1. Tải cấu trúc thực đơn gốc từ file JSON
  const base = await fetch("/data/menu.json", { cache: "no-store" })
    .then(r => r.json());

  // 2. Tải trạng thái tắt/bật (active/inactive) từ API Admin
  let adminPatch = {};
  try {
    adminPatch = await fetch("/api/data/menu", { cache: "no-store" }).then(r => r.json());
  } catch {
    console.warn("Không thể tải trạng thái menu từ API");
  }

  // 3. GỘP DỮ LIỆU: Patch từ Admin sẽ đè lên cấu trúc gốc
  // Biến MENU này sẽ được export để trang Admin hiển thị đầy đủ checkbox
  MENU = deepMerge(base, adminPatch);

  // 4. CHUẨN HÓA & LỌC: 
  // Hàm này sẽ loại bỏ những món có active: false để khách không nhìn thấy
  const activeMenu = normalizeMenu(MENU);

  // 5. CẬP NHẬT VÀO STATE: 
  // Chỉ đẩy dữ liệu "sạch" (đã lọc món ẩn) vào State để UI vẽ ra
  setState({ 
    menu: { 
      data: activeMenu, 
      status: "ready",
      updatedAt: Date.now() 
    } 
  });
}
