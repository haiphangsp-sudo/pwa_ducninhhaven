import { kv } from "@vercel/kv";

export default async function handler(req,res){

  if(req.method!=="GET")
    return res.status(405).end();

  try{
    let state = await kv.get("menuState");

    if(typeof state==="string"){
      try{ state=JSON.parse(state); }
      catch{ state={}; }
    }

    res.status(200).json(state||{});
  }catch(e){
    console.error(e);
    res.status(500).json({});
  }
}