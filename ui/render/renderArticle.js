// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  
  // Lấy danh sách sản phẩm (đã chuẩn hóa thành .products trong menuSchema)
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => {
        // Dùng hàm translate chuẩn của bạn để lấy chuỗi nội dung
        const rawContent = translate(product.content);
        
        return `
        <article class="article-card stack gap-m" id="${product.id}">
          <header class="stack gap-s">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            ${product.description 
              ? `<p class="article-card__desc text-muted">${translate(product.description)}</p>` 
              : ""}
          </header>

          <div class="article-card__body stack">
            ${formatParagraphs(rawContent)}
          </div>
        </article>
      `}).join("")}
    </div>
  `;
}

/**
 * Tách chuỗi theo dấu xuống dòng \n và bọc trong thẻ <p>
 */
function formatParagraphs(text) {
  if (!text || typeof text !== "string") return "";
  
  return text
    .split('\n')
    .filter(line => line.trim() !== "") // Loại bỏ dòng trống
    .map(line => `<p class="article-text mb-m">${line.trim()}</p>`)
    .join("");
}