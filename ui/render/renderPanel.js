import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

export function renderPanel(key){

  const container = document.getElementById("hubContent");
  if(!container) return;

  const category = getCategory(key);
  if(!category){
    container.innerHTML="";
    return;
  }

  if(category.ui === "article"){
    container.innerHTML = renderArticle(category);
    return;
  }

  container.innerHTML = renderMenu(category);
}