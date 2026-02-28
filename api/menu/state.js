import { kv } from "@vercel/kv";

export const runtime = "edge";

export default async function handler(req){

  if(req.method==="GET"){
    const state = await kv.get("menuState") || {};
    return Response.json(state);
  }

  if(req.method==="POST"){
    const patch = await req.json();

    let state = await kv.get("menuState") || {};
    state = deepMerge(state,patch);

    await kv.set("menuState",state);
    return Response.json({ok:true});
  }

  if(req.method==="DELETE"){
    await kv.del("menuState");
    return Response.json({ok:true});
  }

  return new Response("",{status:405});
}

function deepMerge(base,patch){
  for(const k in patch){
    if(typeof patch[k]==="object" && patch[k]!==null && !Array.isArray(patch[k])){
      base[k]=deepMerge(base[k]||{},patch[k]);
    }else{
      base[k]=patch[k];
    }
  }
  return base;
}