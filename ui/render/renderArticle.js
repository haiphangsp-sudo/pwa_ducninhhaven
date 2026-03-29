// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";
import { getState } from "../../core/state.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  const products = getProducts(categoryKey);

  if (!products.length) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  // Lấy ngôn ngữ hiện tại để truy xuất trực tiếp vào object
  const lang = getState().lang?.current || 'vi';

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

          <div class="article-card__body stack gap-m">
            ${renderArticleContent(product.content, lang)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * Hàm xử lý Content: Chấp nhận cả chuỗi, Object đơn, hoặc Mảng các Object
 */
function renderArticleContent(content, lang) {
  if (!content) return "";

  // Trường hợp 1: Content là mảng (như trong menu.json của bạn)
  if (Array.isArray(content)) {
    return content
      .map(block => renderBlock(block, lang))
      .join("");
  }

  // Trường hợp 2: Content là một khối duy nhất
  return renderBlock(content, lang);
}

/**
 * Hàm vẽ từng đoạn văn <p>
 */
function renderBlock(block, lang) {
  if (!block) return "";

  // Nếu block là chuỗi thuần túy
  if (typeof block === "string") return `<p>${block}</p>`;

  // Nếu block là Object dịch {"vi": "...", "en": "..."}
  if (typeof block === "object") {
    const text = block[lang] || block['vi'] || ""; 
    return text ? `<p>${text}</p>` : "";
  }

  return "";
}