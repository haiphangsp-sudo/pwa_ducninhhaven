// ui/actions/uiActions.js
import { applyPlaceById } from "../../core/context.js";
import { getState } from "../../core/state.js";

export const UI_ACTIONS = {
  // Logic chọn phòng & quay lại Drawer cũ
  selectPlace: (cmd) => {
    const success = applyPlaceById(cmd.value);
    if (!success) return null;
    const source = cmd.extra || getState().overlay?.source;
    return {
      overlay: { view: source || null, source: null, value: null }
    };
  },

  // Logic mở bảng (Overlay): Lồng ghép ID món (option) vào value
  toggleOverlay: (view, idMon = null, source = null) => ({
    overlay: { 
      view: view || null, 
      value: idMon || null, // data-option chính là ID món để renderItemDetail
      source: source 
    }
  }),

  // Logic thu gọn/mở rộng thanh trạng thái
  toggleOrderStatus: (currentValue) => ({
    orders: { ...getState().orders, isBarExpanded: currentValue !== "true" }
  }),

  // Logic mở Panel (thông tin, hub...)
  togglePanel: (view, option) => ({
    panel: { view, option }
  }),

  // Logic đổi ngôn ngữ
  changeLanguage: (langCode) => ({
    lang: { current: langCode }
  })
};