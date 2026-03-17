

// core/state.js
// Single source of truth.

export const UI = {

  lang:{
    current:"vi"
  },
  meta: {
    version:1
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