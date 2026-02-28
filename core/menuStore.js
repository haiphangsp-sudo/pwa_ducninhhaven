import { validateMenu } from "./menuSchema.js";

export let MENU = {};

export async function loadMenu(){

  /* 1. tải menu chuẩn */
  const base = await fetch("/data/menu.json",{cache:"no-store"}).then(r=>r.json());

  /* 2. kiểm tra schema (đặt tại đây) */
  validateMenu(base);

  /* 3. tải state vận hành */
  let state={};
  try{
    state = await fetch("/api/menu/state").then(r=>r.json());
  }catch{}

  /* 4. merge */
  MENU = deepMerge(base,state);
}