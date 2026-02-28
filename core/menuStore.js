// core/menuStore.js
export let MENU = {};

const OVERRIDE_KEY = "menuOverride";

export async function loadMenu(){

  const res = await fetch("/data/menu.json",{cache:"no-store"});
  const base = await res.json();

  const override = JSON.parse(localStorage.getItem(OVERRIDE_KEY)||"{}");

  MENU = deepMerge(base, override);
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

export function saveOverride(patch){
  const current = JSON.parse(localStorage.getItem(OVERRIDE_KEY)||"{}");
  deepMerge(current,patch);
  localStorage.setItem(OVERRIDE_KEY,JSON.stringify(current));
}