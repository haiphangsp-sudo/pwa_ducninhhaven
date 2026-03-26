// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

export function renderPanel(state) {
  const container = document.querySelector(".page-container");
  if (!container) return;
  const category = getCategory(state.view.panel);
  if (!category) {
    container.innerHTML = "";
    return;
  }
  const containerId = state.view.panel;
  container.innerHTML = `
    <div id="${containerId}" class="category-panel"></div>
   `;
  const menu = document.getElementById(containerId);
  if (menu.innerHTML === ""){
    if (containerId === "intro") {
      document.getElementById(containerId).innerHTML = renderArticle(category);
    } else {
      document.getElementById(containerId).innerHTML = renderMenu(category);
    }
}
}