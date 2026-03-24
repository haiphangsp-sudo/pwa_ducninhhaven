// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

export function renderPanel(state){
  const container = document.querySelector(".category-panel");
  if(!container) return;
  const category = getCategory(state.view.panel);
  if(!category){
    container.innerHTML="";
    return;
  }
  const type = category.ui;

  if(type === "article") container.innerHTML = renderArticle(category);

  if (type === "cart" || type === "instant") container.innerHTML = renderMenu(category);
}