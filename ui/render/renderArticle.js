// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  const products = getProducts(categoryKey);
  if (!products.length) return "";

  return `
    <div class="article-panel">
      ${products.map(product => {
        // Lấy nội dung qua hàm dịch
        const rawContent = translate(product.content);
        
        return `
          <article class="article-card">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            <div class="article-card__body">
              ${formatContent(rawContent)}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function formatContent(text) {
  if (!text) return '<p class="text-muted">...</p>'; // Báo hiệu nếu dữ liệu thực sự trống
  if (typeof text !== "string") return `<p>${JSON.stringify(text)}</p>`; // Debug nếu vẫn là mảng

  // Tách dòng bằng \n và bọc từng dòng vào thẻ p
  return text
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => `<p class="article-text">${line.trim()}</p>`)
    .join("");
}
