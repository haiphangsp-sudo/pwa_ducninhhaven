

// ui/utils/translate.js

import { STRINGS } from "../../data/i18n.js";
import { setState } from "../../core/state.js";

let currentLang = localStorage.getItem("haven_lang") || "vi";

/* ---------- TRANSLATE ---------- */

export function translate(label){

  if(!label) return "";

  if(typeof label === "string")
    return t(label);

  return label[currentLang] || label.vi || "";
}

function t(key){

  const parts = key.split(".");
  let obj = STRINGS;

  for(const p of parts){
    obj = obj?.[p];
  }

  return obj?.[currentLang] || key;
}

/* ---------- LANGUAGE ---------- */

export function getLanguage(){
  return currentLang;
}

export function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "vi";
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

     // setState({}); // re-render app
    };
  });

  function updateActive(){

    el.querySelectorAll("button").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.lang===currentLang);
    });

  }
}