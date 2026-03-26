// ui/utils/cartHelpers.js

import { translate } from "./translate.js";
import { MENU } from "../../core/menuStore.js";

/* =========================
   PUBLIC
========================= */

export function getCartStats(items = []) {
  const stats = items.reduce((acc, it) => {
    const itemPrice = Number(it.price || 0);
    const qty = Number(it.qty || 0);

    acc.totalQty += qty;
    acc.totalPrice += itemPrice * qty;
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
    textFull: `${stats.totalQty} ${itemLabel}`,
    isEmpty
  };
}

export function calculateCartUpdate(currentItems, newItem) {
    // 1. Cầu chì: Nếu không có newItem, trả về mảng cũ luôn, không làm gì cả
    if (!newItem || !newItem.category || !newItem.item) {
        console.warn("Dữ liệu món ăn không hợp lệ:", newItem);
        return currentItems;
    }

    // 2. Lúc này ta chắc chắn newItem đã "sạch", không cần dùng ?. nữa
    const foundIndex = currentItems.findIndex(it => 
        it.category === newItem.category && 
        it.item === newItem.item && 
        it.option === newItem.option
    );

    if (foundIndex > -1) {
        return currentItems.map((it, idx) => 
            idx === foundIndex ? { ...it, qty: it.qty + 1 } : it
        );
    } else {
        return [...currentItems, { ...newItem, qty: 1 }];
    }
}

/**
 * Tra cứu thông tin chi tiết của 1 món từ MENU
 */
export function getFullItemInfo(it) {
  if (!it) return null;

  const categoryData = MENU[it.category];
  const itemData = categoryData?.items?.[it.item];
  const optionData = itemData?.options?.[it.option];

  return {
    ...it, // Giữ: category, item, option, qty
    name: translate(itemData?.label) || it.item, 
    optionLabel: translate(optionData?.label) || "",
    price: optionData?.price || 0,
    subtotal: (optionData?.price || 0) * (it.qty || 1)
  };
}

export function getFullCartItems(items = []) {
  return items.map(it => getFullItemInfo(it));
}