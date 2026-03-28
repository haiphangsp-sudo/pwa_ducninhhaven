import { translate } from "../utils/translate.js";

export function renderArticle(article){

  return article.products.map(article => `
    <div class="article">
      <h2 class="article-title">${translate(article.label)}</h2> 
      <div class="article-content">
      ${article.content
    .map(p => `<p>${translate(p)}</p>`)
    .join("")}
      </div>
    </div>
  `).join("");

}