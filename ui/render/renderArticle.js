// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  
  // 1. Phải đảm bảo getProducts lấy từ category.products
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => {
        // Dùng hàm translate chuẩn của bạn để lấy CHUỖI nội dung
        const rawContent = translate(product.content);
        
        return `
        <article class="article-card stack gap-m" id="${product.id}">
          <header class="stack gap-s">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            ${product.description 
              ? `<p class="article-card__desc text-muted">${translate(product.description)}</p>` 
              : ""}
          </header>

          <div class="article-card__body">
            ${formatArticleBody(rawContent)}
          </div>
        </article>
      `}).join("")}
    </div>
  `;
}

/**
 * BIẾN ĐỔI CHUỖI THÀNH CÁC ĐOẠN VĂN
 * Xử lý triệt để dấu \n trong JSON
 */
function formatArticleBody(text) {
  if (!text || typeof text !== "string") return "";
  
  return text
    .split('\n') // Chẻ chuỗi tại dấu xuống dòng
    .map(line => line.trim()) // Dọn dẹp khoảng trắng thừa
    .filter(line => line.length > 0) // Loại bỏ các dòng trống vô nghĩa
    .map(line => `<p class="article-text mb-m">${line}</p>`) // Bọc vào thẻ p
    .join("");
}