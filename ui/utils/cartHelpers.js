// ui/utils/cartHelpers.js

import { translate } from "./translate.js";
import { MENU } from "../../core/menuStore.js";

/* =========================
   PUBLIC
========================= */

export function getCartStats(items=[]) {
    
    // Gom tất cả tính toán vào 1 vòng lặp duy nhất để tối ưu hiệu suất
    const stats = items.reduce((acc, it) => {  
            
        const itemPrice = Number(it.price || 0);
        const qty = Number(it.qty || 0);

        acc.totalQty += qty;
        acc.totalPrice += (itemPrice * qty);
        return acc;
    }, { totalQty: 0, totalPrice: 0 });

    const countLine = items.length;
    const isEmpty = stats.totalQty === 0;

    const itemLabelKey = stats.totalQty > 1 ? "cart_bar.items" : "cart_bar.item";
    const itemLabel = translate(itemLabelKey);

    return {
        totalQty: stats.totalQty,
        totalPrice: stats.totalPrice,
        totalPriceFormat: stats.totalPrice.toLocaleString("vi-VN") + " đ",
        textLine: `${countLine} ${translate("cart_bar.unique")}`,
        text: itemLabel,
        textFull: `${stats.totalQty} ${itemLabel}`,
        isEmpty
    };
}


/**
 * Hàm làm đầy dữ liệu giỏ hàng (Hydration)
 */
export function getFullCartItems(items = []) {
  return items.map(it => {
    // 1. Truy xuất dữ liệu danh mục và món ăn từ MENU
    const categoryData = MENU?.[it.category];
    const itemData = categoryData?.items?.[it.item];
    
    // 2. Truy xuất dữ liệu option cụ thể (để lấy giá và tên option)
    const optionData = itemData?.options?.[it.option];

    // 3. Kết hợp dữ liệu bằng Spread Operator
    return {
      ...it, // Giữ nguyên: category, item, option, qty (và các thuộc tính cũ khác)
      
      // Bổ sung dữ liệu hiển thị từ MENU
      name: itemData?.name || "Unknown Item",
      image: itemData?.image || "",
      
      // Lấy giá từ option, nếu không có thì mặc định là 0
      price: optionData?.price || 0,
      
      // Bổ sung tên option (ví dụ: "Size L", "Nóng"...) nếu cần hiển thị
      optionLabel: optionData?.label || "",
      
      // Tính tổng tiền cho riêng món này (Subtotal)
      subtotal: (optionData?.price || 0) * (it.qty || 0)
    };
  });
}


export function calculateCartUpdate(currentItems, newItem) {
    // Tìm xem món này đã có trong giỏ chưa (trùng category, item và option)
    const foundIndex = currentItems.findIndex(it => 
        it.category === newItem.category && 
        it.item === newItem.item && 
        it.option === newItem.option
    );

    if (foundIndex > -1) {
        // Nếu ĐÃ CÓ: Trả về mảng mới với món đó được tăng qty (dùng spread ...it)
        return currentItems.map((it, idx) => 
            idx === foundIndex ? { ...it, qty: it.qty + 1 } : it
        );
    } else {
        // Nếu CHƯA CÓ: Trả về mảng mới có thêm món mới vào cuối
        return [...currentItems, { ...newItem, qty: 1 }];
    }
}