// ui/actions/uiActions.js
import { applyPlaceById } from "../../core/context.js";
import { getState } from "../../core/state.js";

export const UI_ACTIONS = {
  // Logic chọn phòng: Trả về state để quay lại Drawer cũ nếu có source
  selectPlace: (cmd) => {
    const success = applyPlaceById(cmd.value);
    if (!success) return null;

    // Lấy nguồn để quay lại: Ưu tiên extra từ nút, nếu không có thì lấy trong State
    const source = cmd.extra || getState().overlay?.source;
    return {
      overlay: {
        view: source || null,
        source: null,
        value: value
      }
    };
  },

  // Logic đóng/mở Overlay
  toggleOverlay: (view, value = null, source = null) => ({
    overlay: { view: view || null, source: source, value: value ||null }
  }),

  // Logic thu gọn/mở rộng thanh trạng thái
  toggleOrderStatus: (currentValue) => ({
    orders: {
      ...getState().orders,
      isBarExpanded: currentValue !== "true"
    }
  }),

  // Logic mở Panel
  togglePanel: (view, option) => ({
    panel: { view, option }
  })
};