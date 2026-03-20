// core/menuStore.js
//   Tải menu chuẩn từ server, sau đó merge với state vận hành (nếu có) để có menu hoàn chỉnh cho app
//   Menu được lưu trong biến toàn cục MENU, các component có thể import và sử dụng

import { validateMenu, normalizeMenu } from "./menuSchema.js";

export let MENU = {};

export async function loadMenu() {
  const base = await fetch("/data/menu.json", { cache: "no-store" }).then(r => r.json());

  normalizeMenu(base);
  validateMenu(base);

  let state = {};
  try {
    state = await fetch("/api/menu/state", { cache: "no-store" }).then(r => r.json());
  } catch {}

  MENU = deepMerge(base, state);
}

function deepMerge(base,patch){
  const out = structuredClone(base);

  for(const k in patch){
    if (typeof patch[k] === "object" && patch[k] !== null && !Array.isArray(patch[k])
    && typeof out[k] === "object") {
      out[k]=deepMerge(out[k]||{},patch[k]);
    }else{
      out[k]=patch[k];
    }
  }
  return out;
}