import { getCategory, getProducts } from "../../core/menuQuery.js";

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
          return `<p>${block}</p>`;
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
function translate(label) {
  const currentLang = getState().lang.current;

  if (!label) return "";

  // 1. string key
  if (typeof label === "string") {
    return t(label, currentLang);
  }

  // 2. array → map từng phần tử
  if (Array.isArray(label)) {
    return label.map(item => translate(item));
  }

  // 3. object đa ngôn ngữ
  if (typeof label === "object") {
    return label[currentLang] || label.vi || label.en || "";
  }

  return "";
}