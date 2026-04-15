// ui/actions/uiActions.js
import { applyPlaceById } from "../../core/context.js";
import { getState } from "../../core/state.js";

export const UI_ACTIONS = {
  // Lấy data từ button (cmd) và nhét vào State Overlay
  toggleOverlay: (cmd) => ({
    overlay: { 
      view: cmd.value || null,   // Ví dụ: "cartDrawer" hoặc "orderTrackerPage"
      value: cmd.option || null, // Ví dụ: ID món cho itemDetail
      source: cmd.extra || null  // Nguồn để quay lại (nếu có)
    }
  }),
    selectPlace: (cmd) => {
    const success = applyPlaceById(cmd.value);
    if (!success) return null;

    const nextView = cmd.extra || null; 
        if (nextView === "orderTrackerPage") {
            return {
                overlay: { view: nextView, source: null, value: null }
            };
        } else {
            return {
                overlay: { view: null, source: null, value: null }
            };
        }
    },
  

  toggleOrderStatus: (currentValue) => ({
    orders: { ...getState().orders, isBarExpanded: currentValue !== "true" }
  }),

  togglePanel: (cmd) => ({
    panel: { view: cmd.value, option: cmd.option }
  }),

  changeLanguage: (langCode) => ({
    lang: { current: langCode }
  })
};