// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";
import { getState } from "../../core/state.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  
  // getProducts giờ đây phải lấy từ category.products (do menuSchema đã đổi tên)
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
    return `
      <div class="article-panel p-xl center text-muted">
        ${translate("article.empty") || "Chưa có nội dung"}
      </div>
    `;
  }

  // Lấy ngôn ngữ hiện tại để xử lý nội dung bài viết
  const lang = getState().lang?.current || 'vi';

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
            ${renderArticleContent(product.content, lang)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * Xử lý mảng nội dung bài viết
 */
function renderArticleContent(content, lang) {
  if (!content) return "";

  // Trường hợp 1: Content là mảng các đoạn văn (như trong menu.json của bạn)
  if (Array.isArray(content)) {
    return content.map(block => {
      // Nếu block là object dịch {"vi": "...", "en": "..."}
      if (block && typeof block === "object") {
        const text = block[lang] || block.vi || "";
        return text ? `<p class="article-text mb-m">${text}</p>` : "";
      }
      // Nếu block là chuỗi thuần túy
      if (typeof block === "string") {
        return `<p class="article-text mb-m">${block}</p>`;
      }
      return "";
    }).join("");
  }

  // Trường hợp 2: Content là chuỗi đơn hoặc object đơn
  if (typeof content === "string") return `<p class="article-text">${content}</p>`;
  if (typeof content === "object") {
    const text = content[lang] || content.vi || "";
    return text ? `<p class="article-text">${text}</p>` : "";
  }

  return "";
}