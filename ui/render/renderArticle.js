// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  const products = getProducts(categoryKey);

  if (!products.length) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => `
        <article class="article-card stack gap-m" id="${product.id}">
          <header class="stack gap-s">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            ${product.description 
              ? `<p class="article-card__desc text-muted">${translate(product.description)}</p>` 
              : ""}
          </header>

          <div class="article-card__body stack">
            ${renderArticleContent(product.content)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * QUAN TRỌNG: Hàm xử lý nội dung Object {vi, en} có chứa \n
 */
function renderArticleContent(content) {
  // 1. Dùng hàm translate chuẩn của bạn để lấy ra chuỗi (string)
  const rawText = translate(content);

  // 2. Nếu không phải chuỗi hoặc rỗng thì thoát
  if (!rawText || typeof rawText !== "string") return "";

  // 3. Xử lý dấu xuống dòng \n
  // Tách chuỗi thành mảng bằng \n, lọc bỏ dòng trống, và bọc mỗi dòng trong thẻ <p>
  return rawText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p class="article-paragraph">${line}</p>`)
    .join("");
}