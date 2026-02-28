export default async function handler(req,res){

  if(req.method!=="POST")
    return res.status(405).end();

  const { pin } = req.body;

  if(pin === process.env.ADMIN_PIN){
    return res.status(200).json({ok:true});
  }

  return res.status(401).json({error:"Invalid PIN"});
}