// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */
export function renderPanel(state) {
  const nextPanel = state.view.panel;
  const container = document.querySelector(".page-container");
  if (!container) return;

  const menu = document.getElementById(nextPanel);
  if (!menu) {
    container.insertAdjacentHTML("beforeend", `<div id="${nextPanel}" class="category-panel"></div>`);
  }else{
    menu.classList.add("animate-fade-in");
    if (menu.children.length === 0) {
      const category = getCategory(state.view.panel);

      if (nextPanel === "intro") {
        menu.innerHTML = renderArticle(category);
      } else {
        menu.innerHTML = renderMenu(category);
      }
    }
  }
  const panels = document.querySelectorAll(".category-panel");
  if (panels) {
    panels.forEach(panel => {
      if (panel.id !== nextPanel)
        panel.classList.add("hidden");
      else
        panel.classList.remove("hidden");
    });
  }
}

