

// core/state.js
// Single source of truth.
import { getContext } from "./context.js";

export const UI = {
  lang:{
    current: localStorage.getItem("haven_lang") || "vi"
  },
  meta: {
    version:1
  },
  /* ---------------- SERVICE CONTEXT ---------------- */

  context: {
    anchor: null,   // {mode:"room|table|area", id:string, ts: number}
    active: null, // {place:"T1|T2|T3...", id:string}
  },
  /* ---------------- NAVIGATION ---------------- */

  view:{
    panel: "intro",
    overlay: null // placePicker || cartDrawer
  },

  /* ---------------- CART ---------------- */

  cart: {
    items: [],    // 'idle' (mặc định), 'modified' (đã sửa), 'sending' (đang gửi), 
    status: 'idle' // 'success' (thành công - thay cho ack), 'error' (lỗi)
  },

  /* ---------------- ACK (tap feedback) ---------------- */

  ack:{
    state:"hidden"   // hidden | show
  },

  /* ---------------- ORDERS ---------------- */


  orders: {
    active: [], // Lưu danh sách đơn hàng: [{id, status, items, time}, ...]
    isBarExpanded: true // Trạng thái thu nhỏ/mở rộng của thanh Mini
  },

  /* ---------------- DELIVERY STATE MACHINE ---------------- */

  delivery:{
    state:"idle",    // idle | pending | sending | sent | failed
    retries:0
  },
  /* ---------------- RECOVERY STATE MACHINE ---------------- */

  recovery:{
    state:"idle"   // idle | found | sending
  },

  /* ---------------- ERROR ---------------- */

  error:{
    active:false,
    message:null
  },

  /* ---------------- IDLE ---------------- */

  idle:{
    timer:null,
    timeoutMs:180000
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
      anchor: ctx?.anchor|| null,
      active: ctx?.active|| null
    }
  });

}