// ui/actions/uiActions.js
import { applyPlaceById } from "../../core/context.js";
import { getState } from "../../core/state.js";

export const UI_ACTIONS = {
  // Logic chọn phòng: Áp dụng vị trí và quyết định đường về (source)
  selectPlace: (cmd) => {
    const success = applyPlaceById(cmd.value);
    if (!success) return null;

    // Lấy nguồn quay về: Ưu tiên extra từ nút, nếu không có thì lấy từ State overlay
    const source = cmd.extra || getState().overlay?.source;
    
    return {
      overlay: {
        view: source || null, // Quay lại cartDrawer nếu có source
        source: null,
        value: null
      }
    };
  },

  // Logic đóng/mở Overlay
  toggleOverlay: (view, source = null) => {
    return {
      overlay: {
        view: view || null,
        source: source,
        value: null
      }
    };
  },

  // Logic thu gọn/mở rộng thanh trạng thái đơn hàng
  toggleOrderStatus: (currentValue) => {
    return {
      orders: {
        ...getState().orders,
        isBarExpanded: currentValue !== "true"
      }
    };
  },

  // Logic mở Panel (thông tin phòng, menu phụ...)
  openPanel: (view, option) => {
    return {
      panel: { view, option }
    };
  }
};