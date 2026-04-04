import { kv } from "@vercel/kv";

export default async function handler(req,res){

  if(req.method!=="GET")
    return res.status(405).end();

  try{
    let menu = await kv.get("menuState");
    let places = await kv.get("placesState");
    if(typeof menu==="string"){
      try{ menu=JSON.parse(menu); }
      catch{ menu={}; }
    }
    if(typeof places==="string"){
      try{ places=JSON.parse(places); }
      catch{ places={}; }
    }

    res.status(200).json(menu || {});
    res.status(200).json(places||{});
  }catch(e){
    console.error(e);
    res.status(500).json({});
  }
}