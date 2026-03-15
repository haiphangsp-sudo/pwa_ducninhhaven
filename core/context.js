// core/context.js
// Quản lý ngữ cảnh phục vụ (phòng/bàn/điểm phục vụ) của khách
// Lưu trong localStorage để tồn tại qua các phiên, nhưng có TTL để tránh lỗi khi khách quên đóng app

import { PLACES } from "../data/places.js";
import { updateNavContext } from "../ui/interactions/updateData.js";

const KEY="haven_context";
const ACTIVE_TTL = 30*60*1000;      // 60 phút
const ANCHOR_TTL = 24*60*60*1000;   // 24 giờ

/* -------------------------------------------------- */
/* resolve id → place object */

export function resolvePlace(id){

  if(PLACES.rooms[id])  return {type:"room",id};
  if(PLACES.tables[id]) return {type:"table",id};
  if(PLACES.areas[id])  return {type:"area",id};

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
  updateNavContext();
  window.dispatchEvent(new Event("contextChanged"));
}

/* -------------------------------------------------- */
/* QR scan → identity */

export function setAnchor(place){

  const ctx=load();
  const now=Date.now();
  ctx.anchor={
    ...place,
    ts:now
  };

  ctx.active={
    ...place,
    ts:now
  };

  save(ctx);
}

/* -------------------------------------------------- */
/* picker → service location */

export function setActive(place){

  const ctx=load();

  // khách ngoài không được set phòng
  if(place.type==="room" && ctx.anchor?.type!=="room")
    return;

  ctx.active={
    ...place,
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
  if (!ctx) return true;
  if (!ctx.anchor) return true;
  return false;
}