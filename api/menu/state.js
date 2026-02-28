import fs from "fs/promises";

const PATH = "./public/data/menu.state.json";

export default async function handler(req,res){

  if(req.method!=="POST")
    return res.status(405).end();

  try{

    const patch = req.body;

    let state={};
    try{
      state = JSON.parse(await fs.readFile(PATH,"utf8"));
    }catch{}

    deepMerge(state,patch);

    await fs.writeFile(PATH,JSON.stringify(state,null,2));

    res.status(200).json({ok:true});

  }catch(e){
    res.status(500).json({error:e.message});
  }
}

function deepMerge(base,patch){
  for(const k in patch){
    if(typeof patch[k]==="object" && base[k])
      deepMerge(base[k],patch[k]);
    else
      base[k]=patch[k];
  }
}