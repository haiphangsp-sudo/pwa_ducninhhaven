import { getCategory, getProducts } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  const category = getCategory(categoryKey);
  if (!category || category.ui !== "article") return "";

  const products = getProducts(categoryKey);

  if (!products.length) {
    return `
      <div class="article-panel stack gap-l">
        <div class="text-muted">
          ${translate("article.empty") || "Chưa có nội dung"}
        </div>
      </div>
    `;
  }

  return `
    <div class="article-panel stack gap-l">
      ${products.map(product => `
        <article class="article-card stack gap-m">
          <header class="stack gap-s">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            ${product.description
              ? `<p class="article-card__desc text-muted">${translate(product.description)}</p>`
              : ""
            }
          </header>

          <div class="article-card__body stack gap-m">
            ${renderArticleContent(product.content)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderArticleContent(content) {
  if (!content) return "";

  // 1) object đa ngôn ngữ: { vi, en }
  if (!Array.isArray(content) && typeof content === "object") {
    const text = translate(content);
    return renderParagraphs(text);
  }

  // 2) string thường
  if (typeof content === "string") {
    return renderParagraphs(content);
  }

  // 3) mảng block
  if (Array.isArray(content)) {
    return content
      .map(block => {
        if (typeof block === "string") {
          return renderParagraphs(block);
        }

        if (block && typeof block === "object") {
          return renderParagraphs(translate(block));
        }

        return "";
      })
      .filter(Boolean)
      .join("");
  }

  return "";
}

function renderParagraphs(text) {
  if (!text || typeof text !== "string") return "";

  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join("");
}