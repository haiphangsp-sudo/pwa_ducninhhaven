// ui/actions/uiActions.js
import { applyPlaceById } from "../../core/context.js";
import { getLocationInfo } from "../../core/placesQuery.js";

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
          return {overlay: { view: nextView}};
      } else {
          return {overlay: { view: null}};
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
    order: { action: cmd.action, line: cmd.value, status: cmd.option, at: Date.now() }
  }),
  buyNow: (cmd) => {
    const { placeId } = getLocationInfo();
    
    if (!placeId) {
      return {
        order: { status: "waiting_place" },
        overlay: { view: "placePicker" }
      };
    } else {
      return {
        order: { action: cmd.action, status: cmd.option,line: cmd.value, at: Date.now() }
      };
    }
  },
  sendCart: (cmd) => ({
    order: { action: cmd.action, status: null, line: null, at: Date.now() }
  })
}
