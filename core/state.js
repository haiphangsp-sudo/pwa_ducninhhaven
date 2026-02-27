// core/state.js
//Single source of truth.
export const UI = {
    lang:{
        current:"vi"   // vi | en
    },
  context: {
    mode: null,     // "room" | "table"
    place: null
  },

  view:{
  panel:"intro"   // intro | food | drink | service | help
  },

  cart: {
    items: []       // {category,item,option,qty}
  },

  // ACK overlay (blocking rất ngắn)
  ack: {
    state: "hidden"   // hidden | show
  },

  // Delivery trạng thái nền
  delivery: {
    state: "idle",    // idle | pending | sending | stalled
    retries: 0
  },

  request: {
    sending: false
  },

  error: {
    active: false,
    message: null
  },

  idle: {
    timer: null,
    timeoutMs: 60000
  }

};

let listeners = [];

export function subscribe(fn){
  listeners.push(fn);
}

export function setState(patch){

  deepMerge(UI, patch);

  listeners.forEach(fn => fn(UI));
}


function deepMerge(target, source){
  for(const key in source){
    if(typeof source[key] === "object" && source[key] !== null){
      if(!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}