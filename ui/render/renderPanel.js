// ui/render/renderPanel.js

import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

export function renderPanel(state) {
  const panel = state.panel.view; 
  const container = document.querySelector(".page-container");
  
  if (!container || !panel) return;

  const panelEl = document.getElementById(panel);

  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${panel}" class="category-panel stack hidden"></div>`
    );
  }
  const isNewLang = syncLanguage(state);
  
  if (panelEl.innerHTML !== "" && !isNewLang) {
     toggleVisibility(panel);
  } else {

    panelEl.innerHTML = renderMenu(panel);
      
    panelEl.innerHTML = renderArticle(panel);
  } 

}


/* =========================
   PRIVATE
========================= */

function syncLanguage(state) {
  const currentLang = state.lang.current;
  const cls = document.body.classList;
  if (cls.contains(currentLang)) return false;
  cls.remove('vi', 'en');
  cls.add(currentLang);
  return true; 
}



function toggleVisibility (panel) {
  
document.querySelectorAll(".category-panel").forEach(el => {
      if (el.id === panel) {
        el.classList.remove("hidden");
        el.classList.add("animate-fade-in");
      } else {
        el.classList.add("hidden");
        el.classList.remove("animate-fade-in");
      }
    });
  }
  

