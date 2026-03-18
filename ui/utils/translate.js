

// ui/utils/translate.js

import { STRINGS } from "../../data/i18n.js";
import { setState, getState } from "../../core/state.js";


/* ---------- TRANSLATE ---------- */

export function translate(label){

  if (!label) return "";
  const currentLang = getState().lang.current;

  if(typeof label === "string")
    return t(label, currentLang);

  return label[currentLang] || label.vi || "";
}

function t(key){

  const parts = key.split(".");
  let obj = STRINGS;

  for(const p of parts){
    obj = obj?.[p];
  }

  return obj?.[lang] || key;
}

/* ---------- LANGUAGE ---------- */

function setLanguage(lang) {
  setState({ lang: { current: lang } });
  localStorage.setItem("haven_lang", currentLang);
  window.dispatchEvent(new Event("languagechange"));
}

/* ---------- UI SWITCH ---------- */

export function initLangSwitch(){

  const el = document.getElementById("langSwitch");
  if(!el) return;

  updateActive();

  el.querySelectorAll("button").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      setLanguage(lang);
      updateActive();
    };
  });

  function updateActive(){
    const currentLang = getState().lang.current;
    el.querySelectorAll("button").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.lang===currentLang);
    });

  }
}