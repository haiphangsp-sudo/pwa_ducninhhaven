// services/network.js
//Quản lý trạng thái online/offline + timeout chuẩn.
let online = navigator.onLine;
let listeners = [];

window.addEventListener("online", ()=>{
  online = true;
  listeners.forEach(fn=>fn(true));
});

window.addEventListener("offline", ()=>{
  online = false;
  listeners.forEach(fn=>fn(false));
});

export function isOnline(){
  return online;
}

export function onNetworkChange(fn){
  listeners.push(fn);
}

/* fetch có timeout */
export async function fetchWithTimeout(url,options={},timeout=8000){

  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(),timeout);

  try{
    const res = await fetch(url,{
      ...options,
      signal:controller.signal
    });
    return res;
  }finally{
    clearTimeout(id);
  }
}
export async function checkInternet() {
  try {
    const response = await fetch('https://www.google.com/favicon.ico',
    { mode: 'no-cors' });
    return response.ok || response.type === 'opaque';
  } catch (e) {
    return false;
  }
}
