// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  
  // Lấy danh sách sản phẩm (đã được menuSchema đổi items -> products)
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => {
        // 1. Lấy chuỗi nội dung đã dịch (ví dụ: "Chào mừng...\n\nHy vọng...")
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
            ${formatContent(rawContent)}
          </div>
        </article>
      `}).join("")}
    </div>
  `;
}

/**
 * Hàm quan trọng nhất: Chuyển đổi chuỗi \n thành các thẻ <p>
 */
function formatContent(text) {
  if (!text || typeof text !== "string") return "";
  
  // Tách văn bản thành các đoạn dựa trên dấu xuống dòng \n
  return text
    .split('\n')
    .map(line => line.trim()) // Xóa khoảng trắng thừa ở đầu/cuối dòng
    .filter(line => line.length > 0) // Loại bỏ các dòng trống
    .map(line => `<p class="article-text mb-m">${line}</p>`) // Bọc mỗi đoạn vào thẻ <p>
    .join("");
}