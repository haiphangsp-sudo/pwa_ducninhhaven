
// ui/render/renderArticle.js

import { translate } from "../utils/translate.js";
import { getCategory, getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey,ui) {
  if (!categoryKey) return "";

  const category = getCategory(categoryKey);
  if (!category || ui !== "article") return "";

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

  const articleType = category.articleType || categoryKey;

  switch (articleType) {
    case "intro":
      return renderIntro(products);

    case "promotion":
      return renderPromotion(products);

    default:
      return renderStandard(products);
  }
}

/* =========================
   ARTICLE LAYOUTS
========================= */

function renderStandard(products) {
  return `
    <div class="article-panel stack gap-l">
      ${products.map(product => renderArticleEntry(product)).join("")}
    </div>
  `;
}

function renderIntro(products) {
  return `
    <section class="article-panel article-panel--intro stack gap-xl">
      ${products.map(product => `
        <article class="article-card article-card--intro stack gap-m">
          <header class="stack gap-s">
            <h1 class="article-card__title">${translate(product.label)}</h1>
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
    </section>
  `;
}

function renderPromotion(products) {
  return `
    <section class="article-panel article-panel--promotion grid gap-l">
      ${products.map(product => `
        <article class="article-card article-card--promo stack gap-m">
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
    </section>
  `;
}

/* =========================
   SINGLE ENTRY
========================= */

function renderArticleEntry(product) {
  return `
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
  `;
}

/* =========================
   CONTENT RENDERER
========================= */

function renderArticleContent(content) {
  if (!content) return "";

  if (typeof content === "string") {
    return `<p>${content}</p>`;
  }

  if (!Array.isArray(content) && typeof content === "object") {
    const text = translate(content);
    return typeof text === "string" ? `<p>${text}</p>` : "";
  }

  if (Array.isArray(content)) {
    return content
      .map(block => {
        if (typeof block === "string") {
          return `<p class="content">${block}</p>`;
        }

        if (block && typeof block === "object") {
          const text = translate(block);
          return typeof text === "string" ? `<p>${text}</p>` : "";
        }

        return "";
      })
      .filter(Boolean)
      .join("");
  }

  return "";
}