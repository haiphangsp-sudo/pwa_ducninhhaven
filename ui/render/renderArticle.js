// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";
import { getState } from "../../core/state.js"; // Cần để lấy ngôn ngữ hiện tại

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  const products = getProducts(categoryKey);

  if (!products.length) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  // 1. Lấy ngôn ngữ hiện tại từ State
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

          <div class="article-card__body stack">
            ${renderArticleContent(product.content, lang)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

/**
 * Hàm xử lý nội dung: Lặp qua mảng các đoạn văn
 */
function renderArticleContent(content, lang) {
  if (!content) return "";

  // Nếu là mảng (như trong menu.json: "content": [...])
  if (Array.isArray(content)) {
    return content.map(block => renderBlock(block, lang)).join("");
  }

  // Nếu là một khối duy nhất
  return renderBlock(content, lang);
}

/**
 * Hàm vẽ từng khối (Block) nội dung
 */
function renderBlock(block, lang) {
  if (!block) return "";

  // Trường hợp là Object dịch: {"vi": "...", "en": "..."}
  if (typeof block === "object") {
    // Lấy nội dung theo ngôn ngữ, nếu không có thì lấy tiếng Việt làm dự phòng
    const text = block[lang] || block['vi'] || "";
    return text ? `<p class="article-text mb-m">${text}</p>` : "";
  }

  // Trường hợp là chuỗi thuần túy
  if (typeof block === "string") {
    return `<p class="article-text mb-m">${block}</p>`;
  }

  return "";
}