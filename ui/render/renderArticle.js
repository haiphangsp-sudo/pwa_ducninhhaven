
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

/* =========================
   PUBLIC
========================= */

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  const products = getProducts(categoryKey);

  const entries = Object.entries(products)
    .filter(([, product]) => product?.active !== false);

  if (entries.length === 0) {
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
      ${entries.map(([key, product]) => renderArticleEntry(product, key)).join("")}
    </div>
  `;
}

function renderArticleEntry(product, key) {
  const title = product?.label ? translate(product.label) : key;
  const desc = product?.description ? translate(product.description) : "";
  const body = normalizeArticleContent(product?.content);

  return `
    <article class="article-card stack gap-m">
      <header class="stack gap-s">
        <h2 class="article-card__title">${title}</h2>
        ${desc ? `<p class="article-card__desc text-muted">${desc}</p>` : ""}
      </header>

      <div class="article-card__body stack gap-m">
        ${body}
      </div>
    </article>
  `;
}

function normalizeArticleContent(content) {
  if (!content) return "";

  const translated = translate(content);

  // content là string thường
  if (typeof translated === "string") {
    return `<p>${translated}</p>`;
  }

  // content là mảng đoạn văn
  if (Array.isArray(translated)) {
    return translated
      .filter(Boolean)
      .map(block => `<p>${block}</p>`)
      .join("");
  }

  // content là object phức tạp
  if (typeof content === "object") {
    const raw = translate(content);

    if (Array.isArray(raw)) {
      return raw
        .filter(Boolean)
        .map(block => `<p>${block}</p>`)
        .join("");
    }

    if (typeof raw === "string") {
      return `<p>${raw}</p>`;
    }
  }

  return "";
}