// core/actions.js
import { sendRequest } from "../services/api.js"; 
import { isOnline } from "../services/network.js"; 
import { getState, setState } from "./state.js";
import { showToast } from "../ui/utils/uiHelpers.js";
import { getFullCartItems, getCartStats } from "../ui/utils/cartHelpers.js";

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