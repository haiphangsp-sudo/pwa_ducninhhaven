
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

  const translated = translate(content);

  // 1) string
  if (typeof translated === "string") {
    return `<p>${translated}</p>`;
  }

  // 2) array of strings
  if (Array.isArray(translated)) {
    return translated
      .filter(Boolean)
      .map(block => `<p>${block}</p>`)
      .join("");
  }

  // 3) object đa ngôn ngữ nhưng translate không unwrap được như mong đợi
  if (translated && typeof translated === "object") {
    // a. object có sections
    if (Array.isArray(translated.sections)) {
      return translated.sections
        .map(section => {
          if (typeof section === "string") {
            return `<p>${section}</p>`;
          }

          if (section && typeof section === "object") {
            const title = section.title ? `<h3>${section.title}</h3>` : "";
            const body = Array.isArray(section.body)
              ? section.body.filter(Boolean).map(p => `<p>${p}</p>`).join("")
              : section.body
                ? `<p>${section.body}</p>`
                : "";

            return `<section class="stack gap-s">${title}${body}</section>`;
          }

          return "";
        })
        .join("");
    }

    // b. object fallback
    const values = Object.values(translated).filter(v => typeof v === "string");
    if (values.length) {
      return values.map(v => `<p>${v}</p>`).join("");
    }
  }

  return "";
}