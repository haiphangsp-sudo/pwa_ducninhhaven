import { translate } from "../utils/translate.js";

export function renderArticle(articles){
  if (!articles) return "";
  return articles.products.map(art => `
    <div class="article">
      <h2 class="article-title">${translate(art.label)}</h2> 
      <div class="article-content">
      ${art.content
    .map(p => `<p>${translate(p)}</p>`)
    .join("")}
      </div>
    </div>
  `).join("");

}