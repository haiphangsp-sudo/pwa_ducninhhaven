

// core/state.js
// Single source of truth.

export const UI = {

  lang:{
    current:"vi"
  },

  /* ---------------- SERVICE CONTEXT ---------------- */

  context:{
    anchor:null,   // {type:"room|table|area", id:string}
    active:null    // {type:"room|table|area", id:string}
  },

  /* ---------------- NAVIGATION ---------------- */

  view:{
    panel:"intro"
  },

  /* ---------------- CART ---------------- */

  cart:{
    items:[]
  },

  /* ---------------- ACK (tap feedback) ---------------- */

  ack:{
    state:"hidden"   // hidden | show
  },

  /* ---------------- DELIVERY STATE MACHINE ---------------- */

  delivery:{
    state:"idle",    // idle | pending | sending | sent | failed
    retries:0
  },

  /* ---------------- ERROR ---------------- */

  error:{
    active:false,
    message:null
  },

  /* ---------------- IDLE ---------------- */

  idle:{
    timer:null,
    timeoutMs:60000
  }

};

/* ======================================================= */

let listeners=[];

export function subscribe(fn){
  listeners.push(fn);
}

export function setState(patch){

  deepMerge(UI,patch);

  listeners.forEach(fn=>fn(UI));
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