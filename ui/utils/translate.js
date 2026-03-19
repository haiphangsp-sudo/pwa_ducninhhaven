import { STRINGS } from "../../data/i18n.js";
import { getState, setState } from "../../core/state.js";

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

function setLanguage(l) {
  const current = getState().lang.current;
  if (!l || current === l) return;
  localStorage.setItem("haven_lang", l);
  setState({lang: {current: l}});
}

export function attachLangguegeEvents() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("#langSwitch button");
    if (!btn || btn.classList.contains("is-active")) return;
    const key = btn.dataset.lang;
    setLanguage(key)
  });
}