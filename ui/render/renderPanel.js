// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

export function renderPanel(key){

  const container = document.querySelector(".category-panel");
  if(!container) return;

  const category = getCategory(key);
  const type = category.ui;

  if(!category){
    container.innerHTML="";
    return;
  }

  if(type === "article") container.innerHTML = renderArticle(category);

  if (type === "cart" || type === "instant") container.innerHTML = renderMenu(category);
}