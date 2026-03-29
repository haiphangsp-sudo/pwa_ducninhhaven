// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => `
        <article class="article-card stack gap-m">
          <header class="stack gap-s">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            ${product.description 
              ? `<p class="article-card__desc text-muted">${translate(product.description)}</p>` 
              : ""}
          </header>

          <div class="article-card__body stack">
            ${formatContent(translate(product.content))}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * Biến đổi chuỗi văn bản có \n thành các thẻ <p>
 */
function formatContent(text) {
  if (!text) return "";
  
  // Tách chuỗi bằng dấu xuống dòng và lọc bỏ các dòng trống
  return text
    .split('\n')
    .filter(line => line.trim() !== "")
    .map(line => `<p class="article-text mb-m">${line.trim()}</p>`)
    .join("");
}