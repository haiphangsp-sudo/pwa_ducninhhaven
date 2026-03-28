
import { translate } from "../utils/translate.js";
import { getProducts, getCategory } from "../../core/menuQuery.js";

/* =========================
   PUBLIC
========================= */

export function renderArticle(categoryKey, ui) {
  if (!categoryKey) return "";

  const category = getCategory(categoryKey);
  if (!category) return "";

  const products = getProducts(categoryKey);

  if (products.length === 0) {
    return `
      <div class="article-panel stack gap-l">
        <div class="text-muted">
          ${translate("article.empty") || "Chưa có nội dung"}
        </div>
      </div>
    `;
  }

  const articleType = category.articleType || category.key || categoryKey;

  switch (articleType) {
    case "intro":
      return renderIntroArticle(products);

    case "promotion":
      return renderPromotionArticle(products);

    default:
      return renderStandardArticle(products);
  }
}

/* =========================
   LAYOUTS
========================= */

function renderStandardArticle(products) {
  return `
    <div class="article-panel stack gap-l">
      ${products.map(product => renderArticleEntry(product)).join("")}
    </div>
  `;
}

function renderIntroArticle(products) {
  return `
    <section class="intro-panel stack gap-xl">
      ${products.map(product => `
        <article class="intro-block stack gap-m">
          <header class="stack gap-s">
            <h1 class="intro-title">${translate(product.label)}</h1>
            ${product.description ? `
              <p class="intro-desc text-muted">${translate(product.description)}</p>
            ` : ""}
          </header>
          <div class="intro-body stack gap-m">
            ${normalizeArticleContent(product.content)}
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderPromotionArticle(products) {
  return `
    <section class="promo-panel grid gap-l">
      ${products.map(product => `
        <article class="promo-card stack gap-m">
          <header class="stack gap-s">
            <h2 class="promo-title">${translate(product.label)}</h2>
            ${product.description ? `
              <p class="promo-desc text-muted">${translate(product.description)}</p>
            ` : ""}
          </header>
          <div class="promo-body stack gap-s">
            ${normalizeArticleContent(product.content)}
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

/* =========================
   ENTRY
========================= */

function renderArticleEntry(product) {
  const title = product?.label ? translate(product.label) : "";
  const desc = product?.description ? translate(product.description) : "";
  const body = normalizeArticleContent(product?.content);

  return `
    <article class="article-card stack gap-m">
      <header class="stack gap-s">
        ${title ? `<h2 class="article-card__title">${title}</h2>` : ""}
        ${desc ? `<p class="article-card__desc text-muted">${desc}</p>` : ""}
      </header>
      <div class="article-card__body stack gap-m">
        ${body}
      </div>
    </article>
  `;
}

/* =========================
   CONTENT NORMALIZER
========================= */

function normalizeArticleContent(content) {
  if (!content) return "";

  const translated = translate(content);

  if (typeof translated === "string") {
    return `<p>${translated}</p>`;
  }

  if (Array.isArray(translated)) {
    return translated
      .filter(Boolean)
      .map(block => `<p>${block}</p>`)
      .join("");
  }

  return "";
}