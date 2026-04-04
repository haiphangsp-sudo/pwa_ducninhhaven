
import { validateMenu, normalizeMenu } from "./menuSchema.js";
import { setState } from "./state.js";
import { deepMerge } from "../data/helpers.js";


export let MENU = {}; // Biến chứa TOÀN BỘ thực đơn (cho Admin)

// core/menuStore.js hoặc placesStore.js

export async function loadMenu() {
  // 1. Fetch dữ liệu
  const base = await fetch("/data/menu.json").then(r => r.json());
  const patch = await fetch("/api/data/menu").catch(() => ({}));
  
  // 2. Gộp dữ liệu
  let data = deepMerge(base, patch);

  // 3. Chuẩn hóa (Sửa lỗi định dạng, thêm default values)
  normalizeMenu(data);

  try {
    // 4. KIỂM TRA (Validate)
    // Nếu dữ liệu không vượt qua bài kiểm tra này, nó sẽ throw Error
    validateMenu(data); 

    // 5. Cập nhật State (Chỉ chạy khi dữ liệu đã "Sạch" và "Đúng")
    setState({ menu: { data, status: "ready" } });

  } catch (error) {
    // Nếu dữ liệu lỗi, ta giữ nguyên State cũ và báo lỗi ra Console
    console.error("[Haven Check] Dữ liệu Menu bị lỗi, không thể cập nhật:", error.message);
    
    // Tùy chọn: Gửi báo cáo lỗi về server Admin tại đây
  }
}