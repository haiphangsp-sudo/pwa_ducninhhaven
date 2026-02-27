// core/queue.js
// Offline-first persistent queue (transaction-safe)

import { sendRequest } from "../services/api.js";
import { setState } from "./state.js";
import { getRetryDelay } from "../services/retryPolicy.js";

const STORAGE_KEY = "haven_queue";

let processing = false;
let retryTimer = null;
let waitingRetry = false;

/* ---------------- STORAGE ---------------- */

export function loadQueue(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveQueue(queue){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/* ---------------- ENQUEUE ---------------- */

export function enqueue(payload){

  const queue = loadQueue();

  queue.push({
    id: payload.id,
    payload,
    retries: 0,
    createdAt: Date.now()
  });

  saveQueue(queue);

  setState({
    delivery:{state:"pending"}
  });

  if(!processing && !waitingRetry)
    processQueue();
}

/* ---------------- PROCESS ---------------- */

export async function processQueue(){

  if(processing || waitingRetry) return;

  processing = true;

  let queue = loadQueue();

  if(queue.length){
    setState({
      delivery:{ state:"sending" }
    });
  }

  while(queue.length){

    const req = queue[0];

    try{

      await sendRequest(req.payload);

      queue.shift();
      saveQueue(queue);

      if(queue.length===0){
        setState({
          delivery:{state:"idle"}
        });
      }

    }catch(e){

      req.retries++;
      saveQueue(queue);

      setState({
        delivery:{
          state: req.retries>=3 ? "stalled" : "sending",
          retries: req.retries
        }
      });

      const delay = getRetryDelay(req.retries);

      waitingRetry = true;
      processing = false;

      if(retryTimer) clearTimeout(retryTimer);

      retryTimer = setTimeout(()=>{
        retryTimer = null;
        waitingRetry = false;
        processQueue();
      }, delay);

      return;
    }
  }

  processing = false;
}

/* ---------------- EVENTS ---------------- */

// user chọn "Gửi lại"
window.addEventListener("resumeQueue", ()=>{
  waitingRetry = false;
  if(!processing) processQueue();
});

// mạng quay lại
window.addEventListener("networkBack", ()=>{
  const queue = loadQueue();

  if(queue.length){

    if(retryTimer){
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    waitingRetry = false;

    if(!processing)
      processQueue();
  }
});