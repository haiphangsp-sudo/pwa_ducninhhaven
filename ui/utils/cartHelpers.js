// ui/utils/cartHelpers.js
import { MENU } from "../../core/menuStore.js";
import { translate } from "./translate.js";

export function getCartStats(items=[]) {
    
    // Gom tất cả tính toán vào 1 vòng lặp duy nhất để tối ưu hiệu suất
    const stats = items.reduce((acc, it) => {
        const itemPrice = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
        const qty = Number(it.qty || 0);

        acc.totalQty += qty;
        acc.totalPrice += (itemPrice * qty);
        return acc;
    }, { totalQty: 0, totalPrice: 0 });

    const countLine = items.length;
    const isEmpty = countLine === 0;

    const itemLabelKey = stats.totalQty > 1 ? "cart_bar.items" : "cart_bar.item";
    const itemLabel = translate(itemLabelKey);

    return {
        totalQty: stats.totalQty,
        totalPrice: stats.totalPrice,
        totalPriceFormat: stats.totalPrice.toLocaleString("vi-VN") + " đ",
        countLine,
        textLine: `${countLine} ${translate("cart_bar.unique")}`,
        text: itemLabel,
        textFull: `${stats.totalQty} ${itemLabel}`,
        isEmpty
    };
}