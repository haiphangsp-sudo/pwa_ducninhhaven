// ui/utils/cartHelpers.js
import { UI } from "../../core/state.js";
import { MENU } from "../../core/menuStore.js";

export function getCartStats() {
    const items = UI.cart.items || [];
    
    const totalQty = items.reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const count = items.length; // Số loại món (lines)
    
    let totalPrice = 0;
    items.forEach(it => {
        const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price || 0;
        totalPrice += (price * it.qty);
    });

    return { totalQty, totalPrice, count };
}