// core/queue.js
//   Hệ thống queue để gửi yêu cầu đến server một cách tuần tự, tránh trùng lặp và đảm bảo độ tin cậy

import { sendRequest } from "../services/api.js";
import { setState } from "./state.js";
import { getRetryDelay } from "../services/retryPolicy.js";

const STORAGE_KEY = "haven_queue";

let processing=false;
let retryTimer=null;

/* ---------------- STORAGE ---------------- */

export function loadQueue(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveQueue(q){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}

/* ---------------- STATE HELPERS ---------------- */

function emitDelivery(state,extra={}){
  setState({
    delivery:{ state, ...extra }
  });
}

function emitRecovery(state){
  setState({
    recovery:{ state }
  });
}

/* ---------------- ENQUEUE ---------------- */

export function enqueue(payload){

  const queue=loadQueue();

  queue.push({
    id:payload.id,
    payload,
    retries:0,
    createdAt:Date.now()
  });

  saveQueue(queue);
  setState({ ack:{state:"show"} });
  emitDelivery("pending");
  if(!processing) processQueue();
}

/* ---------------- PROCESS ---------------- */

export async function processQueue(){

  if(processing) return;

  const queue=loadQueue();
  if(!queue.length){
    emitDelivery("idle");
    return;
  }

  processing=true;
  emitDelivery("sending");

  while(queue.length){

    const req=queue[0];

    try{

      await sendRequest(req.payload);

      queue.shift();
      saveQueue(queue);

      if(!queue.length){
        emitDelivery("sent");
        setTimeout(()=>emitDelivery("idle"),2000);
      }

    }catch(e){

      req.retries++;
      saveQueue(queue);

      emitDelivery("failed",{retries:req.retries});

      const delay=getRetryDelay(req.retries);

      processing=false;
      retryTimer=setTimeout(processQueue,delay);
      return;
    }
  }

  processing=false;
}

/* ---------------- RECOVERY DETECT ---------------- */

export function detectRecovery(){
  if(loadQueue().length){
    emitRecovery("found");
  }
}

/* ---------------- EVENTS ---------------- */

window.addEventListener("resumeQueue",()=>{
  emitRecovery("sending");
  processQueue();
});

window.addEventListener("networkBack",()=>{
  if(loadQueue().length){
    processQueue();
  }
});