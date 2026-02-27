// services/api.js
//Lớp gửi request chính (kèm secret, validate response).
import { CONFIG } from "../config.js";
import { isOnline, fetchWithTimeout } from "./network.js";
import { markSuccess } from "./health.js";
export async function sendRequest(payload){

  if(!isOnline()){
    throw new Error("offline");
  }

  const body = JSON.stringify({
    ...payload,
    secret: CONFIG.API_SECRET
  });

  let res;

  try{

    res = await fetchWithTimeout(
      CONFIG.API_ENDPOINT,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body
      },
      6000
    );

  }catch(e){
    throw new Error("network");
  }

  if(!res.ok){
    throw new Error("server");
  }

  let data;

  try{
    data = await res.json();
  }catch{
    throw new Error("invalid_json");
  }

  if(data.status==="unauthorized") throw new Error("unauthorized");
  if(data.status==="rate_limited") throw new Error("rate_limited");
  if(data.status==="duplicate") return data;

  if(data.status!=="ok"){
    throw new Error("unknown");
  }
  markSuccess();
  return data;
}