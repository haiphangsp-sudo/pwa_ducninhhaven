// core/actions.js
import { sendRequest } from "../services/api.js"; 
import { isOnline } from "../services/network.js"; 
import { getState, setState } from "./state.js";
import { showToast } from "../ui/utils/uiHelpers.js";
import { getFullCartItems, getCartStats } from "../ui/utils/cartHelpers.js";


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



export async function requestOrderThamKhao(line = null) {
  const state = getState();

  // 1. Kiểm tra điều kiện tiên quyết (Guards)
  if (!isOnline()) return showToast("Mất kết nối mạng", "error");
  if (!state.context?.active?.place) {
    return setState({ view: { ...state.view, overlay: "placePicker" } });
  }

  // 2. Chống bấm nhiều lần (Debounce/Loading)
  if (state.ui.isOrdering) return;
  setState({ ui: { ...state.ui, isOrdering: true } });

  // 3. Chuẩn bị dữ liệu (Payload)
  let payload;
  
  if (line) {
    // KỊCH BẢN MUA NGAY: Tạo payload từ duy nhất 1 món này
    payload = {
      type: "INSTANT",
      location: state.context.active.place,
      items: [{ ...line, qty: 1, name: getMenuName(line) }],
      total: getMenuPrice(line)
    };
  } else {
    // KỊCH BẢN GỬI GIỎ: Lấy từ State
    if (state.cart.items.length === 0) return;
    payload = {
      type: "CART",
      location: state.context.active.place,
      items: getFullCartItems(state.cart.items),
      total: getCartStats(state.cart.items).totalPrice
    };
  }

  // 4. Gửi đơn hàng đi thông qua api.js
  try {
    const result = await sendRequest(payload);
    if (result.success) {
      // Nếu là đơn giỏ hàng thành công thì mới xóa giỏ
      if (!line) setState({ cart: { items: [] } }); 
      
      setState({ ack: { state: "show", status: "success" } });
    }
  } catch (err) {
    showToast("Lỗi gửi đơn", "error");
  } finally {
    setState({ ui: { ...state.ui, isOrdering: false } });
  }
}


export async function processOrder(payload) {
  try {
    // Gọi API thực tế
    const result = await sendRequest(payload); 
    
    // Gọi hàm thông báo để xử lý UI & Hậu mãi (clearCart...)
    notifyResponse(result, payload);
    
  } catch (error) {
    // Xử lý các lỗi bị throw từ api.js (offline, network, retry)
    notifyResponse(error, payload);
  } finally {
    // Tắt trạng thái loading trên nút bấm
    setState({ ui: { isOrdering: false } });
  }
}