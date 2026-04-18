// ui/actions/uiActions.js
import { applyPlaceById } from "../../core/context.js";

export const UI_ACTIONS = {
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
      if (nextView === "cartDrawer") {
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
    orders: { isBarExpanded: currentValue !== "true" }
  }),

  togglePanel: (cmd) => ({
    panel: { view: cmd.value, option: cmd.option }
  }),

  changeLanguage: (langCode) => ({
    lang: { current: langCode }
  }),
  addCart: (cmd) => ({
    order: { action: cmd.action, line: cmd.value, status: "added", at: Date.now() }
  })
}