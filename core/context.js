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

  ctx.anchor={
    ...place,
    ts:Date.now()
  };

  ctx.active={
    ...place,
    ts:Date.now()
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

  if(ctx.anchor && now-ctx.anchor.ts>ANCHOR_TTL){
    ctx.anchor=null;
    changed=true;
  }

  if(ctx.active && now-ctx.active.ts>ACTIVE_TTL){
    ctx.active=null;
    changed=true;
  }

  if(!ctx.active && ctx.anchor){
    ctx.active={...ctx.anchor,ts:now};
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
export function normalizeContext(){

  const ctx=getContext();
  if(!ctx) return;

  save(ctx);
}