// core/context.js
// Quản lý ngữ cảnh phục vụ (phòng/bàn/điểm phục vụ) của khách
// Lưu trong localStorage để tồn tại qua các phiên, nhưng có TTL để tránh lỗi khi khách quên đóng app

import { PLACES } from "../data/places.js";
import { updateNavContext } from "../ui/components/navBar.js";

const KEY="haven_context";
const ACTIVE_TTL = 30*60*1000;      // 60 phút
const ANCHOR_TTL = 24*60*60*1000;   // 24 giờ

/* -------------------------------------------------- */
/* resolve id → place object */

export function resolvePlace(id){

  if(PLACES.room[id])  return {mode:"room",id};
  if(PLACES.table[id]) return {mode:"table",id};
  if(PLACES.area[id])  return {mode:"area",id};

  return null;
}

/* -------------------------------------------------- */
/* INTERNAL */

function load(){
  try{
    return JSON.parse(localStorage.getItem(KEY)) || {};
  }catch{
    return {};
  }
}

function save(ctx){
  localStorage.setItem(KEY,JSON.stringify(ctx));
  window.dispatchEvent(new Event("contextChanged"));
}

/* -------------------------------------------------- */
/* QR scan → identity */

export function setAnchor(place){

  const ctx = getContext();

  ctx.active = {
    ...place,
    ts:Date.now()
  }
  ctx.anchor={
    mode:place.id,
    ts:Date.now()
  };

  save(ctx);
}

/* -------------------------------------------------- */
/* picker → service location */

export function setActive(place){

  
  ctx.active = {
    mode:place.id,
    ts:Date.now()
  };

  save(ctx);
}

/* -------------------------------------------------- */

export function getContext(){

  const ctx=load();
  if(!ctx.anchor && !ctx.active) return null;

  const now=Date.now();

  let changed=false;
  // Xoá anchor nếu quá cũ, coi như khách quên quét QR code
  if(ctx.anchor && now-ctx.anchor.ts>ANCHOR_TTL){
    ctx.anchor=null;
    ctx.active=null;
    changed=true;
  }
// Xoá active nếu quá cũ, coi như khách quên chọn nơi phục vụ
  if(ctx.active && now-ctx.active.ts>ACTIVE_TTL){
    ctx.active=null;
    changed=true;
  }


  if(changed) save(ctx);
  
  return ctx;
}

/* -------------------------------------------------- */
/* convenience */

export function getActivePlace(){
  return getContext()?.active || null;
}

export function getAnchor(){
  return getContext()?.anchor || null;
}

// Chuẩn hoá lại context khi app load, để xoá những chỗ phục vụ đã quá cũ
export function normalizeContext(){

  const ctx=getContext();
  if(!ctx) return;

  save(ctx);
}
//  Xoá context, ví dụ khi khách rời đi mà quên quét QR code để xoá anchor, hoặc quên chọn nơi phục vụ để xoá active. Hoặc đơn giản là để test.
export function clearContext(){
  localStorage.removeItem(KEY);
  updateNavContext();
  window.dispatchEvent(new Event("contextChanged"));
}
// Cập nhật giao diện nav bar theo context mới, ví dụ sau khi quét QR code hoặc chọn nơi phục vụ
export function initContext(){
  normalizeContext();
  bindClick();
}

/* ===================================================== */

export function needsPlaceSelection(){
  const ctx=getContext();
  const mode = ctx.anchor?.type || "table";
  if (mode === "table") return !ctx?.active?.table;
  if (mode === "area" ) return !ctx?.active?.area&&!ctx?.active?.table;
  if (mode === "room") return !ctx?.active?.room && !ctx?.active?.area && !ctx?.active?.table;
  
  return true;
  
}