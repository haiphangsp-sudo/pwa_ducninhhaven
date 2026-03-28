

// core/state.js
// Single source of truth.
import { getContext } from "./context.js";
import { CONFIG } from "../config.js";


export const UI = {
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
    selected: null // T1, T2, .....
  },
  panel: {
    view: "intro" // food || drink ....
  },
  overlay: {
    view: null  // close || placePicker || cartDrawer ....
  },
  order: {
    type: "cart", // cart || instant || send_card
    line: null
  },
  /* ---------------- CART ---------------- */

  cart: {
    items: [],    // 'idle' (mặc định), 'modified' (đã sửa), 'sending' (đang gửi), 
    status: 'idle' // 'success' (thành công - thay cho ack), 'error' (lỗi)
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
