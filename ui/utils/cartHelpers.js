// ui/utils/cartHelpers.js
import { UI } from "../../core/state.js";
import { MENU } from "../../core/menuStore.js";
import { translate } from "./translate.js";

export function getCartStats() {
    const itemsCart = UI.cart.items || [];
    
    const totalQty = itemsCart.reduce((a, b) => a + Number(b.qty || 0), 0);
    
    const countLine = itemsCart.length; // Số loại món (lines)
    
    let totalPrice = 0;

    itemsCart.forEach(it => {
        const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
        totalPrice += (price * it.qty);
    });

    const totalPriceFormat = totalPrice.toLocaleString("vi-VN") + " đ";

    const text = totalQty > 1
        ? translate("cart_bar.items")
        : translate("cart_bar.item");
    
    const textFull = totalQty > 1
        ? totalQty + " " + translate("cart_bar.items")
        : totalQty + " " + translate("cart_bar.item");
    
    const isEmpty = countLine === 0;
    
    return { totalQty, totalPrice, totalPriceFormat, countLine, text, textFull ,isEmpty};

}