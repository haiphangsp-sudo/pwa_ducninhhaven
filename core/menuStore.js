// core/menuStore.js

export let MENU = {};

const LOCAL_KEY = "menuOverride";

export async function loadMenu(){

  const base = await fetch("/data/menu.json",{cache:"no-store"}).then(r=>r.json());

  let state = {};
  try{
    state = await fetch("/data/menu.state.json",{cache:"no-store"}).then(r=>r.json());
  }catch{}

  let local = {};
  try{
    local = JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}");
  }catch{}

  MENU = deepMerge(base, state);
  MENU = deepMerge(MENU, local);
}
export function saveOverride(patch){
  const current = JSON.parse(localStorage.getItem(OVERRIDE_KEY)||"{}");
  deepMerge(current,patch);
  localStorage.setItem(OVERRIDE_KEY,JSON.stringify(current));
}
/* merge đơn giản */
function deepMerge(base, patch){
  for(const k in patch){
    if(typeof patch[k]==="object" && base[k])
      base[k]=deepMerge(base[k],patch[k]);
    else
      base[k]=patch[k];
  }
  return base;
}