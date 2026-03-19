import { translate } from "../utils/translate.js";

export function renderArticle(category){

  return category.items.map(item => `
    <div class="article">
      <h2 class="article-title">${translate(item.label)}</h2> 
      <div class="article-content">
      ${item.content
    .map(p => `<p>${translate(p)}</p>`)
    .join("")}
      </div>
    </div>
  `).join("");

}