// ui/utils/translate.js

import { t } from "../../data/i18n.js";

export function translate(label){

  if(!label) return "";

  // label từ STRINGS (key)
  if(typeof label === "string")
    return t(label);

  // label từ MENU {vi,en}
  const lang = localStorage.getItem("haven_lang") || "vi";

  return label[lang] || label.vi || "";
}