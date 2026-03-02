// core/request.js
//   Gửi yêu cầu đến server thông qua queue, đảm bảo thứ tự và tránh trùng lặp

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