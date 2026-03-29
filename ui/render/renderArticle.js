// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";
import { getState } from "../../core/state.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
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
 * HÀM XỬ LÝ NỘI DUNG "VẠN NĂNG"
 * Chấp nhận: Mảng, Object có \n, hoặc Chuỗi thuần túy
 */
function renderArticleContent(content) {
  if (!content) return "";

  // TRƯỜNG HỢP 1: Content là MẢNG (Như trong ảnh Console của bạn)
  if (Array.isArray(content)) {
    return content
      .map(block => {
        const text = translate(block); // Dịch từng phần tử trong mảng
        return text ? formatTextToParagraphs(text) : "";
      })
      .join("");
  }

  // TRƯỜNG HỢP 2 & 3: Content là Object {vi, en} hoặc String
  const text = translate(content);
  return formatTextToParagraphs(text);
}

/**
 * Hàm phụ trợ: Chuyển đổi mọi chuỗi có \n thành các thẻ <p>
 */
function formatTextToParagraphs(text) {
  if (!text || typeof text !== "string") return "";
  
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p class="article-paragraph mb-m">${line}</p>`)
    .join("");
}