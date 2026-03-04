// core/idle.js
// Automatic UI reset (không ảnh hưởng delivery)

import { UI, setState } from "./state.js";

export function resetIdleTimer(){

  clearTimeout(UI.idle.timer);

  UI.idle.timer = setTimeout(() => {

    setState({
      view:{ panel:"intro" },
      ack:{state:"hidden"}   // chỉ đóng overlay xác nhận nếu còn
    });

  }, UI.idle.timeoutMs);

}
