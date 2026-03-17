// core/queue.js



import { sendRequest } from "../services/api.js";
import { setState, getState } from "./state.js";
import { getRetryDelay } from "../services/retryPolicy.js";
import { getContext } from "./context.js";
import { clearCart } from "./events.js"
import { setDeliveryState } from "../ui/render/renderDelivery.js";
import { setRecoveryState } from "../ui/render/renderRecovery.js";



const STORAGE_KEY="haven_queue";
const MAX_QUEUE = 50;
let recoveryEmitted = false;
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

function emitRecovery(state) {
  const current = getState().recovery?.state;
  if (current === state) return;
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
  setDeliveryState("sending"); //đang gửi
  while(queue.length){

    const req=queue[0];
    const job=req.payload;

    try{

      const ctx=getContext();
      const anchor=ctx?.anchor;

        const body={
          id:req.id,
          device: navigator.userAgent,
          time: Date.now(),
          ...job
        };

      await sendRequest(body);
        if(job.type === "cart") clearCart();
      queue.shift();
      saveQueue(queue);

      if (queue.lenght === 0) {
        recoveryEmitted = false;
        emitRecovery("idle");
      }

      if (!queue.length) {
        setDeliveryState("send"); //màu xanh: thành công
        setTimeout(() => {
          setDeliveryState("idle");
          setState({
            ack: { state: "hidden" }
          });
        },2500);
      }

    }catch(e){

      if(e.message!=="retry"||e.message==="network"){
        queue.shift();
        saveQueue(queue);
        continue;
      }

      req.retries++;
      saveQueue(queue);

      setDeliveryState("failed",{retries:req.retries}); // Hiện màu đỏ, thử lại

      const delay=getRetryDelay(req.retries);

      processing=false;
      setTimeout(processQueue,delay);
      return;
    }
  }

  processing=false;
}

/* ---------- RECOVERY ---------- */

export function detectRecovery() {
  const q = loadQueue();
  if (!q.length) return;

  if (q.length && !recoveryEmitted) {
    recoveryEmitted = true;
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
