// core/actions.js
import { setState } from "./state.js";
import { sendCart } from "./events.js";
import { showToast } from "../ui/utils/uiHelpers.js";



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
export async function actionSendCart() {
  // 1. Logic bắt đầu: Hiện Loading
  setState({ ack: { state: "show", status: "sending" } });

  // 2. Gọi Helper nội bộ
  const result = await sendCart();

  // 3. Logic kết thúc: Dọn dẹp chiến trường
  if (result === "ok") {
    setState({
      cart: { items: [], status: 'idle' },
      overlay: { view: null },
      order: { type: "cart", line: null },
      ack: { state: "show", status: "success" }
    });
    
    // Auto-hide thông báo
    setTimeout(() => setState({ ack: { state: "hidden" } }), 3000);
  } else {
    // Xử lý khi có lỗi
    setState({ ack: { state: "show", status: "error" } });
  }
}

