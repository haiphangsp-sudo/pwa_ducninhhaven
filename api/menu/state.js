// api/menu/state.js
// API route for menu state management (admin only).
// State được lưu trên KV với key "menuState".

import { kv } from "@vercel/kv";
if(req.headers["x-admin-pin"] !== process.env.ADMIN_PIN){
  return res.status(401).json({error:"Unauthorized"});
}
export default async function handler(req,res){

  try{

    if(req.method==="GET"){
  let state = await kv.get("menuState");

  if(typeof state === "string"){
    try{ state = JSON.parse(state); }
    catch{ state = {}; }
  }

  if(!state || typeof state!=="object")
    state = {};
  return res.status(200).json(state);
}

    if(req.method==="POST"){
      const patch = req.body ?? {};

      let state = await kv.get("menuState") ?? {};
      state = deepMerge(state,patch);

      await kv.set("menuState", JSON.stringify(state));
      return res.status(200).json({ok:true});
    }

    if(req.method==="DELETE"){
      await kv.del("menuState");
      return res.status(200).json({ok:true});
    }

    res.status(405).end();

  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message});
  }
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