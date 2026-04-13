// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getCategory } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  const category = getCategory(categoryKey);
  const items = category?.items || {};

  const articles = Object.entries(items)
    .filter(([, item]) => item?.active !== false)
    .map(([key, item]) => {
      return `
        <section class="article" id="${key}">
          <h2 class="menu-group-title">${translate(item.label)}</h2>
          ${formatArticleContent(item.content)}
        </section>
      `;
    })
    .join("");

  if (!articles) {
    return `
      <div class="article">
        <p>${"Đang cập nhật nội dung..."}</p>
      </div>
    `;
  }

  return articles;
}

function formatArticleContent(content) {
  const raw = translate(content);

  if (!raw || typeof raw !== "string") return "";

  return raw
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${line}</p>`)
    .join("");
}