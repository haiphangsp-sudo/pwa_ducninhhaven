import { kv } from "@vercel/kv";

export default async function handler(req,res){

  if(req.headers["x-admin-pin"]!==process.env.ADMIN_PIN)
    return res.status(401).end();

  try{

    if(req.method==="POST"){
      const patch=req.body||{};
      let menu = await kv.get("menuState") || {};
      let places = await kv.get("placesState") || {};
      menu = deepMerge(menu, patch);
      places = deepMerge(places, patch);
      await kv.set("menuState", JSON.stringify(menu));
      await kv.set("placesState", JSON.stringify(places));
      return res.status(200).json({ok:true});
    }

    if(req.method==="DELETE"){
      await kv.del("menuState");
       await kv.del("placesState");
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