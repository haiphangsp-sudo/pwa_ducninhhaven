import { enqueue } from "./queue.js";
import { getContext } from "./context.js";

export function sendRequest(action,payload={}){

  const ctx=getContext();
  if(!ctx) throw "NO_CONTEXT";

  enqueue({
    target:ctx,
    action,
    payload,
    ts:Date.now()
  });
}