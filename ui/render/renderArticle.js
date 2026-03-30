import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

/**
 * Render giao diện bài viết giới thiệu (Article)
 * @param {string} categoryKey - Key của category (ví dụ: 'intro')
 */
export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  // 1. Lấy danh sách sản phẩm (đã chuẩn hóa qua menuQuery)
  const products = getProducts(categoryKey);

  // 2. Nếu rỗng, trả về thông báo (đã dịch)
  if (!products || products.length === 0) {
    return `
      <div class="article-empty p-xl center text-muted">
        ${translate("article.empty") || "Chưa có nội dung giới thiệu."}
      </div>
    `;
  }

  // 3. Render danh sách các bài viết
  return `
    <div class="article-container stack gap-xl">
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
            ${formatArticleBody(product.content)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * Hàm phụ trợ: Chuyển đổi chuỗi có \n thành các đoạn văn <p>
 * Đảm bảo nội dung hiển thị thoáng đãng và dễ đọc.
 */
function formatArticleBody(content) {
  // Dùng hàm translate để lấy chuỗi theo ngôn ngữ hiện tại
  const rawText = translate(content);

  if (!rawText || typeof rawText !== "string") return "";

  // Tách dòng, dọn khoảng trắng và bọc vào thẻ <p>
  return rawText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p class="article-paragraph">${line}</p>`)
    .join("");
}