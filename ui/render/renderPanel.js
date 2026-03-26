// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

export function renderPanel(state) {
  const container = document.querySelector(".page-container");

  const containerId = state.view.panel;
  const menu = document.getElementById(containerId);
  if (!container) return;

  let contentHtml = "";
  const category = getCategory(state.view.panel);
  if (!category) return;

  if (containerId === "intro") {
    contentHtml = renderArticle(category);
  } else {
    contentHtml = renderMenu(category);
  }
  if (!menu) {
    container.innerHTML += `
     <div id="${containerId}" class="category-panel animate-fade-in">
      ${contentHtml}
    </div>`
   
  }
}