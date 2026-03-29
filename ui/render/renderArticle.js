// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";
import { getState } from "../../core/state.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";
  
  // Lấy danh sách sản phẩm (đã được normalize thành .products)
  const products = getProducts(categoryKey);

  if (!products || products.length === 0) {
    return `<div class="p-xl center text-muted">${translate("article.empty")}</div>`;
  }

  // Lấy ngôn ngữ hiện tại để truy xuất thẳng vào content
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

function renderArticleContent(content, lang) {
  if (!content) return "";

  // Nếu content là mảng các object {"vi": "...", "en": "..."}
  if (Array.isArray(content)) {
    return content.map(block => {
      // Truy xuất trực tiếp theo ngôn ngữ (lang)
      const text = typeof block === "object" ? (block[lang] || block['vi']) : block;
      return text ? `<p class="article-text mb-m">${text}</p>` : "";
    }).join("");
  }

  // Nếu content là object đơn
  if (typeof content === "object") {
    const text = content[lang] || content['vi'];
    return text ? `<p class="article-text">${text}</p>` : "";
  }

  return typeof content === "string" ? `<p>${content}</p>` : "";
}