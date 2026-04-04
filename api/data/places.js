// api/data/places.js
import { kv } from "@vercel/kv";

export default async function handlerPlaces(req,res){

  if(req.method!=="GET")
    return res.status(405).end();

  try{
    let places = await kv.get("placesState");
   
    if(typeof places==="string"){
      try{ places=JSON.parse(places); }
      catch{ places={}; }
    }

    res.status(200).json(places||{});
  }catch(e){
    console.error(e);
    res.status(500).json({});
  }
}