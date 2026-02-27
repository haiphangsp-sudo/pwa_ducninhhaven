// core/events.js
// Event map (pure logic).

import { setState, UI } from "./state.js";
import { enqueue } from "./queue.js";
import { resetIdleTimer } from "./idle.js";

export function dispatch(type, payload={}){

  resetIdleTimer();

  switch(type){

    case "SET_CONTEXT":
      setState({context:payload});
      break;
      
    case "SET_PANEL":
      setState({
        view:{...UI.view,panel: payload.panel}
      });
    break; 

    case "ADD_TO_CART":
      addToCart(payload);
      break;

    case "SEND_INSTANT":
      sendInstant(payload);
      break;

    case "SEND_CART":
      sendCart();
      break;
  }
}

function addToCart(item){

  const existing = UI.cart.items.find(i =>
    i.category===item.category &&
    i.item===item.item &&
    i.option===item.option
  );

  if(existing){
    existing.qty += 1;
  }else{
    UI.cart.items.push({...item,qty:1});
  }

  setState({cart:{items:UI.cart.items}});
}

function sendInstant(payload){

  const request = createRequest(payload);

  enqueue(request);

  // ACK ngay lập tức + bắt đầu delivery nền
  setState({
    ack:{state:"show"},
    delivery:{state:"pending"}
  });
}

function sendCart(){

  UI.cart.items.forEach(item=>{
    const request = createRequest(item);
    enqueue(request);
  });

  setState({
    ack:{state:"show"},
    delivery:{state:"pending"},
    cart:{items:[]}
  });
}

function createRequest(payload){

  return {
    id: crypto.randomUUID(),
    ...payload
  };
}