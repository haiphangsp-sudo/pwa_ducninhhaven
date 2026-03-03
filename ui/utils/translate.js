// ui/utils/translate.js

import { STRINGS } from "../../data/i18n.js";

export function translate(label){

  if(!label) return "";

  // label từ STRINGS (key)
  if(typeof label === "string")
    return t(label);

  // label từ MENU {vi,en}
  const lang = localStorage.getItem("haven_lang") || "vi";

  return label[lang] || label.vi || "";
}

let currentLang = "vi";

export function setLanguage(lang){
  currentLang = lang==="en" ? "en" : "vi";
}

function t(key){
  return STRINGS[key]?.[currentLang] || key;
}