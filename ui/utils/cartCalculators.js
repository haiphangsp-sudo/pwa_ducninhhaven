import { MENU } from "../../core/menuStore.js";


/**
 * Tính toán tất cả các thông số của giỏ hàng cùng một lúc
 * @param {Array} items - UI.cart.items
 */
export function getCartTotals() {
    const items = UI.cart.items;
    let totalQuantity = 0; // Tổng số lượng (vd: 2 trà + 3 cafe = 5)
    let totalPrice = 0;    // Tổng tiền (vd: 200.000đ)
    const totalUnique = items.length; // Tổng số dòng món (vd: trà và cafe = 2 món)
    
    items.forEach(it => {
        // Lấy giá từ MENU store
        const price = MENU?.[it.category]?.items?.[it.item]?.options?.[it.option]?.price;
        
        totalQuantity += Number(it.qty || 0);
        totalPrice += (price * Number(it.qty || 0));
    });

    return {
        totalQuantity,
        totalPrice,
        totalUnique,
        isEmpty: totalUnique === 0
    };
}
export const getCartStats = (items = []) => {
    return {
        // Tổng số lượng để hiện badge ngoài AppBar
        totalQty: items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0),
        
        // Tổng số loại món để hiện tiêu đề Drawer (vd: "Giỏ hàng (2 món)")
        totalLines: items.length,
        
        // Kiểm tra giỏ trống
        isEmpty: items.length === 0
    };
};