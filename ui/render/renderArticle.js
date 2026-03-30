// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getProducts } from "../../core/menuQuery.js";

export function renderArticle(categoryKey) {
  // Gọi getProducts (bây giờ đã lấy được dữ liệu tươi từ State)
  const products = getProducts(categoryKey);

  if (!products.length) return `<div class="p-xl center opacity-50">${translate("article.empty")}</div>`;

  return `
    <div class="article-panel stack gap-xl">
      ${products.map(product => `
        <article class="article-card stack gap-m">
          <header class="stack gap-s">
            <h2 class="article-card__title">${translate(product.label)}</h2>
            ${product.description ? `<p class="text-muted">${translate(product.description)}</p>` : ""}
          </header>
          <div class="article-card__body">
            ${formatBody(product.content)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function formatBody(content) {
  const text = translate(content);
  if (!text || typeof text !== "string") return "";

  // Xử lý dấu xuống dòng \n mà bạn đã chuẩn hóa trong menu.json
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p class="article-text mb-m">${line}</p>`)
    .join("");
}