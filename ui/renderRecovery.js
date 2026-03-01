import { t } from "../data/i18n.js";

let state="idle";

export function setRecoveryState(s){
  state=s;
  render();
}

function render(){

  const el=document.getElementById("recoveryBanner");
  if(!el) return;

  if(state==="idle"){
    el.classList.add("hidden");
    return;
  }

  el.textContent=t(`recovery.${state}`);
  el.classList.remove("hidden");

  if(state==="found"){
    el.onclick=()=>{
      setRecoveryState("sending");
      window.dispatchEvent(new Event("resumeQueue"));
    };
  }else{
    el.onclick=null;
  }
}