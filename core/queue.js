

import { sendRequest } from "../services/api.js";
import { setState } from "./state.js";
import { getRetryDelay } from "../services/retryPolicy.js";
import { getContext } from "./context.js";

const STORAGE_KEY="haven_queue";
const MAX_QUEUE = 50;

let processing=false;

/* ---------- STORAGE ---------- */

function loadQueue(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
}

function saveQueue(q){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(q));
}

/* ---------- STATE ---------- */

function emitDelivery(state,extra={}){
  setState({delivery:{state,...extra}});
}

function emitRecovery(state){
  setState({recovery:{state}});
}

/* ---------- ENQUEUE ---------- */

export function enqueue(payload){

  const queue=loadQueue();
  
  if (queue.length >= MAX_QUEUE) {
    queue.shift();
  }

  queue.push({
    id:crypto.randomUUID(),
    payload,
    retries:0,
    createdAt:Date.now()
  });

  saveQueue(queue);

  emitDelivery("pending",{count: queue.length});

  if(!processing) processQueue();
}

/* ---------- PROCESS ---------- */

export async function processQueue(){

  if(processing) return;

  let queue=loadQueue();

  if(!queue.length){
    emitDelivery("idle");
    return;
  }

  processing=true;
  emitDelivery("sending");

  while(queue.length){

    const req=queue[0];
    const job=req.payload;

    try{

      const ctx=getContext();
      const anchor=ctx?.anchor;

        const body={
          id:req.id,
          room: anchor?.type === "room" ? anchor.id : "Guest",
          device: navigator.userAgent,
          time: Date.now(),
          ...job
        };

      await sendRequest(body);

      queue.shift();
      saveQueue(queue);

      if(!queue.length){
        emitDelivery("sent");
        setTimeout(()=>emitDelivery("idle"),2000);
      }

    }catch(e){

      if(e.message!=="retry"){
        queue.shift();
        saveQueue(queue);
        continue;
      }

      req.retries++;
      saveQueue(queue);

      emitDelivery("failed",{retries:req.retries});

      const delay=getRetryDelay(req.retries);

      processing=false;
      setTimeout(processQueue,delay);
      return;
    }
  }

  processing=false;
}

/* ---------- RECOVERY ---------- */

export function detectRecovery(){
  if(loadQueue().length){
    emitRecovery("found");
  }
}

/* ---------- EVENTS ---------- */

window.addEventListener("resumeQueue",()=>{
  emitRecovery("sending");
  processQueue();
});

window.addEventListener("networkBack",()=>{
  if(loadQueue().length) processQueue();
});
