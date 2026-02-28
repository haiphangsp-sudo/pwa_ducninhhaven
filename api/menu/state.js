
import { kv } from "@vercel/kv";


import { kv } from "@vercel/kv";
export const runtime = "edge";
export default async function handler(req,res){

  if(req.method==="GET"){
    const state = await kv.get("menuState") || {};
    return res.status(200).json(state);
  }

  if(req.method==="POST"){
    const patch=req.body;

    let state = await kv.get("menuState") || {};
    deepMerge(state,patch);

    await kv.set("menuState",state);
    return res.status(200).json({ok:true});
  }

  if(req.method==="DELETE"){
    await kv.del("menuState");
    return res.status(200).json({ok:true});
  }

  res.status(405).end();
}

function deepMerge(base,patch){
  for(const k in patch){
    if(typeof patch[k]==="object" && base[k])
      deepMerge(base[k],patch[k]);
    else
      base[k]=patch[k];
  }
}