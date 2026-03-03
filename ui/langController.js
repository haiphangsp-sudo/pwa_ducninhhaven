// ui/langController.js
//  Quản lý chuyển đổi ngôn ngữ, lưu vào localStorage và trigger re-render app
import { setLanguage } from "./utils/translate.js";
import { setState } from "../core/state.js";

export function initLangSwitch(){

  const el = document.getElementById("langSwitch");
  if(!el) return;

  const stored = localStorage.getItem("haven_lang");
  if(stored){
    setLanguage(stored);
  }

  updateActive();

  el.querySelectorAll("button").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      setLanguage(lang);
      localStorage.setItem("haven_lang", lang);

      updateActive();

      // trigger re-render toàn app
      setState({});
    };
  });

  function updateActive(){
    const current = localStorage.getItem("haven_lang") || "vi";
    el.querySelectorAll("button").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.lang===current);
    });
  }
}