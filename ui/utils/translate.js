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

export function setLanguage(lang) {
  const next = lang === "en" ? "en" : "vi";

  localStorage.setItem("haven_lang", next);

  setState({
    lang: {
      current: next
    }
  });
}

export function initLangSwitch() {
  const el = document.getElementById("langSwitch");
  if (!el) return;

  updateActive();

  el.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
      updateActive();
    };
  });

  function updateActive() {
    const current = getState().lang.current;

    el.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === current);
    });
  }
}