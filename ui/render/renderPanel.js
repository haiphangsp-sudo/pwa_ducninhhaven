// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */
export function renderPanel(state) {
  const nextPanel = state.panel;
  const container = document.querySelector(".page-container");
  if (!container|| !nextPanel) return;

   let panel = document.getElementById(nextPanel);
    
  if (!panel) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${nextPanel}" class="category-panel"></div>
        `);
    panel = document.getElementById(nextPanel);
  }
  const category = getCategory(nextPanel);
  if(!category||!panel) return;


      if (nextPanel === "intro") {
        panel.innerHTML = renderArticle(category);
      } else {
        panel.innerHTML = renderMenu(category);
      }
    
  
  document.querySelectorAll(".category-panel").forEach(el => {
    if (el.id !== nextPanel) {
      el.classList.add("hidden");
      el.classList.remove("animate-fade-in");
    } else{
      el.classList.remove("hidden", "animate-fade-out");
      el.classList.add("animate-fade-in");
    }
  });
}

