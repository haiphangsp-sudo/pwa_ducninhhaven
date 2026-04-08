

// core/state.js
// Single source of truth.
import { CONFIG } from "../config.js";
import { deepMerge } from "../data/helpers.js";

let listeners=[];
export let UI = {
  /* ---------------- MENU ---------------- */

  menu: {
    data: {}, // Khởi tạo là object rỗng thay vì null để Object.entries không báo lỗi
    status: "loading",
    updatedAt: Date.now() 
  },
  /* ---------------- PLACES ---------------- 

  places: {
    data: {},
    status: "loading",
    updatedAt: Date.now()
  },
   ---------------- LANGUAGE ---------------- */
 places: {
    data: {
      groups: {}, // Object để chứa { room: {...}, table: {...} }
      index: {}  // Object để tìm kiếm nhanh theo ID
    },
    status: "loading",
    updatedAt: Date.now()
  },

  lang:{
    current: localStorage.getItem(CONFIG.LANG_KEY) || "vi"
  },
  meta: {
    version: "2.0.1"
  },
  /* ---------------- SERVICE CONTEXT ---------------- */

  context: {
    anchor: null,   // {place:"room|table|area", id:string, ts: number}
    active: null, // {id:string}
    updatedAt: null
  },
  /* ---------------- NAVIGATION ---------------- */

  panel: {
    view: "drink",   // menu, article, ...
    option: "article",
    mode: "grid"     // Kiểu hiển thị (grid, list)
  },
  /* ---------------- OVERLAY ---------------- */
  overlay: {
    view: null, // close || placePicker || cartDrawer ....
    source: ""
  },

  order: {
    action: null,     // add_cart, buy_now, send_cart
    line: null,     // ID món ăn (nếu có)
    status: "idle", // idle, pending, sending, success, error, waiting_place
    at: null        // Timestamp để syncUI nhận diện cú click mới
  },
  /* ---------------- CART ---------------- */

  cart: {
    items: []
  },
  /* ---------------- ACK (tap feedback) ---------------- */

  ack: {
    visible: false,
    status: null, //"success" | "error" | "info" | "sending"
    title: "",
    message: "",
    at: null
},

  /* ---------------- ORDERS ---------------- */

  orders: {
    active: [], // Lưu danh sách đơn hàng: [{id, status, items, time}, ...] đang nấu
    inactive: [],
    isBarExpanded: false // Trạng thái thu nhỏ/mở rộng của thanh Mini  đơn hàng cũ
  },

  /* ---------------- DELIVERY STATE MACHINE ---------------- */

  delivery:{
    state: "idle",    // idle | pending | sending | sent | failed
    retries: 0
  },
  /* ---------------- RECOVERY STATE MACHINE ---------------- */

  recovery:{
    state: "idle"   // idle | found | sending
  },

  /* ---------------- ERROR ---------------- */

  error:{
    active: false,
    message: null
  },

  /* ---------------- IDLE ---------------- */

  idle:{
    timer: null,
    timeoutMs: 180000
  }

};
/* ======================================================= */


export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(f => f !== fn);
  };
}
export function getState(){
  return { ...UI };
}
export function setState(patch) {
  const nextState = deepMerge(UI, patch);

  // So sánh tham chiếu (Reference) cực nhanh thay vì JSON.stringify
  if (nextState !== UI) {
    UI = nextState;
    // Thông báo cho tất cả các UI Component cập nhật
    listeners.forEach(fn => fn(UI));
  }
}
