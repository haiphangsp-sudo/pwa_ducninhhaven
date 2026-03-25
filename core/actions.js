// core/actions.js

export async function changeCartQtynew({ category, item, option }, delta) {
    const { cart } = getState();
    const currentItems = cart.items;

    const idx = currentItems.findIndex(it => 
        it.category === category && it.item === item && it.option === option
    );

    if (idx === -1) return;

    const newQty = currentItems[idx].qty + delta;

    if (newQty <= 0) {
        // --- BƯỚC MẸO: XỬ LÝ ANIMATION ---
        // Tìm element tương ứng trong Drawer hoặc List
        const selector = `[data-category="${category}"][data-item="${item}"][data-option="${option}"]`;
        const element = document.querySelector(`.drawer__item${selector}`);

        if (element) {
            element.classList.add("item-exit");
            // Đợi animation chạy xong (400ms như trong CSS)
            await new Promise(res => setTimeout(res, 400));
        }

        // Sau khi diễn xong, mới thực sự xóa trong State
        const nextItems = currentItems.filter((_, i) => i !== idx);
        setState({ cart: { ...cart, items: nextItems } });
        
    } else {
        // Cập nhật số lượng bình thường (không cần animation)
        const nextItems = currentItems.map((it, i) => 
            i === idx ? { ...it, qty: newQty } : it
        );
        setState({ cart: { ...cart, items: nextItems } });
    }
}



/**
 * Hàm thay đổi số lượng món ăn
 * @param {Object} itemIdentity - {category, item, option}
 * @param {number} delta - Lượng thay đổi (ví dụ: +1, -1)
 */
export function changeCartQtycu({ category, item, option }, delta) {
    const { cart } = getState();
    const currentItems = cart.items;

    // 1. Tìm vị trí món trong giỏ
    const idx = currentItems.findIndex(it => 
        it.category === category && 
        it.item === item && 
        it.option === option
    );

    let nextItems;

    if (idx > -1) {
        // TRƯỜNG HỢP: Món đã có trong giỏ
        const newQty = currentItems[idx].qty + delta;

        if (newQty <= 0) {
            // Nếu giảm về 0: Xóa món đó (dùng filter để tạo mảng mới)
            nextItems = currentItems.filter((_, i) => i !== idx);
        } else {
            // Nếu > 0: Cập nhật số lượng (dùng map để tạo mảng mới)
            nextItems = currentItems.map((it, i) => 
                i === idx ? { ...it, qty: newQty } : it
            );
        }
    } else if (delta > 0) {
        // TRƯỜNG HỢP: Món chưa có và đang muốn thêm mới (+1)
        nextItems = [...currentItems, { category, item, option, qty: delta }];
    } else {
        // Nếu món chưa có mà lại yêu cầu giảm (-1) thì không làm gì cả
        return;
    }

    // 2. Cập nhật State với mảng mới hoàn toàn
    setState({ 
        cart: { 
            ...cart, 
            items: nextItems 
        } 
    });
}