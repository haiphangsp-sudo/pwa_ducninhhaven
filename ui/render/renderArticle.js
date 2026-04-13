import { translate } from "../utils/translate.js";
import { getCategory, getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  const category = getCategory(categoryKey);
  const products = getProducts(categoryKey);

  const entries = products.length
    ? products
    : Object.entries(category?.items || {})
        .filter(([, item]) => item?.active !== false)
        .map(([key, item]) => ({ ...item, key }));

  if (!entries.length) {
    return `
      <div class="article">
        <p>${translate("article.empty") || "Đang cập nhật nội dung..."}</p>
      </div>
    `;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${entries.map(entry => `
        <article class="article-card stack gap-m" id="${entry.id || entry.key}">
          <header class="article-header stack gap-s">
            <h2 class="article-title">${translate(entry.label)}</h2>
          </header>
          <div class="article-body">
            ${formatArticleContent(entry.content)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function formatArticleContent(content) {
  const raw = translate(content);
  if (!raw || typeof raw !== "string") return "";

  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p class="article-text mb-m">${line}</p>`)
    .join("");
}