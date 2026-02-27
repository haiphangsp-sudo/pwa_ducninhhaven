// services/health.js
//Cung cấp trạng thái cho “health indicator” (góc kỹ thuật).
import { isOnline } from "./network.js";

let lastSuccess = Date.now();

export function markSuccess(){
  lastSuccess = Date.now();
}

export function getHealth(){

  if(!isOnline()) return "offline";

  const diff = Date.now() - lastSuccess;

  if(diff < 15000) return "ok";
  if(diff < 60000) return "slow";

  return "unstable";
}