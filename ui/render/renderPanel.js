// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */
export function renderPanel(state,lastState) {
  const nextPanel = state.view.panel;
  const currentState = lastState.view?.panel;
  const container = document.querySelector(".page-container");
  if (!container) return;

  container.insertAdjacentHTML("beforeend", `<div id="${nextPanel}" class="category-panel animate-fade-in"></div>`);
  const menu = document.getElementById(nextPanel);
  
  if (!menu) {
    const category = getCategory(state.view.panel);
    if (nextPanel === "intro") {
      menu.innerHTML = renderArticle(category);
    } else {
      menu.innerHTML = renderMenu(category);
    }
  }
}

