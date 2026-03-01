import { PLACES } from "../data/places.js";

const KEY="haven_context";

export function resolvePlace(id){

  if(PLACES.rooms[id]) return {type:"room",id};
  if(PLACES.tables[id]) return {type:"table",id};
  if(PLACES.areas[id]) return {type:"area",id};

  return null;
}

export function setContext(ctx){
  localStorage.setItem(KEY,JSON.stringify({
    ...ctx,
    ts:Date.now()
  }));
}

export function getContext(){

  const raw=localStorage.getItem(KEY);
  if(!raw) return null;

  const ctx=JSON.parse(raw);

  if(Date.now()-ctx.ts > 60*60*1000)
    return null;

  return ctx;
}