

// core/state.js
// Single source of truth.
import { getContext } from "./context.js";
import { CONFIG } from "../config.js";


export const UI = {
  /* ---------------- MENU ---------------- */

  menu: {
    data: {}, // Khởi tạo là object rỗng thay vì null để Object.entries không báo lỗi
    status: "loading"
  },
  /* ---------------- LANGUAGE ---------------- */

  lang:{
    current: localStorage.getItem(CONFIG.LANG_KEY) || "vi"
  },
  meta: {
    version: "2.0.0"
  },
  /* ---------------- SERVICE CONTEXT ---------------- */

  context: {
    anchor: null,   // {place:"room|table|area", id:string, ts: number}
    active: null, // {id:string}
    updatedAt: null
  },
  /* ---------------- NAVIGATION ---------------- */
  place: {
    selected: null // ID từ Picker
  },
  panel: {
    view: "intro",   // menu, article, ...
    type: "article",
    mode: "grid"     // Kiểu hiển thị (grid, list)
  },
  /* ---------------- OVERLAY ---------------- */
  overlay: {
    view: null  // close || placePicker || cartDrawer ....
  },
  order: {
    type: null,     // cart, instant, send_cart
    line: null,     // ID món ăn (nếu có)
    status: "idle", // idle, pending, sending, success, error, waiting_place
    msg: "",        // Thông báo phản hồi cho khách
    at: null        // Timestamp để syncUI nhận diện cú click mới
  },
  /* ---------------- CART ---------------- */

  cart: {
    items: [] 
  },
  /* ---------------- ACK (tap feedback) ---------------- */

  ack:{
    state: "hidden",  // hidden | show
    status: null
  },

  /* ---------------- ORDERS ---------------- */


  orders: {
    active: [], // Lưu danh sách đơn hàng: [{id, status, items, time}, ...]
    isBarExpanded: true // Trạng thái thu nhỏ/mở rộng của thanh Mini
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

let listeners=[];

export function subscribe(fn){
  
  listeners.push(fn);
  return ()=>{
    listeners=listeners.filter(f=>f!==fn);
  };
}

export function getState(){
  return structuredClone(UI);
}

export function setState(patch) {
  if (patch.overlay) {
    console.log("Phát hiện lệnh mở Overlay:", patch.overlay);
    console.trace(); // Nó sẽ hiện ra danh sách các hàm đã gọi đến đây
  }
  
  const prev = JSON.stringify(UI);

  deepMerge(UI, patch);
  const next = JSON.stringify(UI);

  if (prev !== next) listeners.forEach(fn => fn(UI));
  
}

/* ======================================================= */

function deepMerge(target,source){
  for(const key in source){

    const value=source[key];

    if(
      typeof value==="object" &&
      value!==null &&
      !Array.isArray(value)
    ){
      if(!target[key]) target[key]={};
      deepMerge(target[key],value);

    }else{
      target[key]=value;
    }
  }
}
export function syncContextToState() {
  const ctx = getContext();
  if (!ctx) return;

  setState({
    context: {
      anchor: ctx?.anchor || null,
      active: ctx?.active || null,
      updatedAt: ctx?.updatedAt || null
    }
  });
}