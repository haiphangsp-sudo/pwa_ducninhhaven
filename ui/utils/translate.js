import { STRINGS } from "../../data/i18n.js";
import { getState } from "../../core/state.js";

export function translate(label) {
  const currentLang = getState().lang.current;

  if (!label) return "";

  if (typeof label === "string") {
    return t(label, currentLang);
  }

  return label[currentLang] || label.vi || "";
}

function t(key, currentLang) {
  const parts = key.split(".");
  let obj = STRINGS;

  for (const p of parts) {
    obj = obj?.[p];
  }

  return obj?.[currentLang] || key;
}

