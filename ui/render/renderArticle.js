// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

/**
 * Render giao diện dạng bài viết (Article)
 */
export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  // 1. Lấy danh sách sản phẩm (welcome, about...) từ menuQuery
  const products = getProducts(categoryKey);

  // 2. Chốt chặn nếu không có dữ liệu
  if (!products || products.length === 0) {
    return `
      <div class="p-xl center opacity-50">
        ${translate("article.empty") || "Đang cập nhật nội dung..."}
      </div>
    `;
  }

  // 3. Render danh sách các thẻ <article>
  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => `
        <article class="article-card stack gap-m" id="${product.id}">
          <header class="article-header stack gap-s">
            <h2 class="article-title">${translate(product.label)}</h2>
            ${product.description 
              ? `<p class="article-subtitle text-muted">${translate(product.description)}</p>` 
              : ""
            }
          </header>

          <div class="article-body">
            ${formatArticleContent(product.content)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * Hàm "chẻ" văn bản: Biến \n thành các thẻ <p>
 */
function formatArticleContent(content) {
  // Dùng hàm translate để lấy chuỗi (string) theo ngôn ngữ hiện tại
  const rawText = translate(content);

  if (!rawText || typeof rawText !== "string") return "";

  // Tách dòng, lọc dòng trống và bọc vào thẻ <p>
  return rawText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p class="article-text mb-m">${line}</p>`)
    .join("");
}