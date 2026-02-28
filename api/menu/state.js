
import { kv } from "@vercel/kv";

export const runtime = "edge";

export default async function handler(request){

  const method = request.method;

  try{

    if(method === "GET"){
      const state = await kv.get("menuState") ?? {};
      return Response.json(state);
    }

    if(method === "POST"){
      const patch = await request.json();

      let state = await kv.get("menuState") ?? {};
      state = deepMerge(state,patch);

      await kv.set("menuState",state);
      return Response.json({ok:true});
    }

    if(method === "DELETE"){
      await kv.del("menuState");
      return Response.json({ok:true});
    }

    return new Response("",{status:405});

  }catch(e){
    return Response.json({error:e.message},{status:500});
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