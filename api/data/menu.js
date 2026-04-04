import { kv } from "@vercel/kv";

export default async function handlerMenu(req,res){

  if(req.method!=="GET")
    return res.status(405).end();

  try{
    let menu = await kv.get("menuState");
    if(typeof menu==="string"){
      try{ menu=JSON.parse(menu); }
      catch{ menu={}; }
    }

    res.status(200).json(menu || {});
  }catch(e){
    console.error(e);
    res.status(500).json({});
  }
}