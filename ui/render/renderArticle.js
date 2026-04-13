// ui/render/renderArticle.js
import { translate } from "../utils/translate.js";
import { getCategory, getProducts } from "../../core/menuQuery.js";

/**
 * Article renderer:
 * - Ưu tiên dữ liệu đã chuẩn hóa qua getProducts()
 * - Fallback về category.items nếu article không đi cùng luồng cart/menu
 * - Hỗ trợ:
 *   + content là string nhiều dòng
 *   + content là mảng đoạn [{vi,en}, ...]
 *   + description / description_long
 *   + block nhấn mạnh nếu sau này muốn dùng:
 *       { type: "highlight", vi: "...", en: "..." }
 */
export function renderArticle(categoryKey) {
  if (!categoryKey) return "";

  const category = getCategory(categoryKey);
  const entries = resolveArticleEntries(categoryKey, category);

  if (!entries.length) {
    return `
      <section class="article">
        <p>Đang cập nhật nội dung...</p>
      </section>
    `;
  }

  return `
    <div class="article-panel stack gap-xl">
      ${entries.map(renderArticleEntry).join("")}
    </div>
  `;
}

function resolveArticleEntries(categoryKey, category) {
  const normalizedProducts = getProducts(categoryKey);

  if (normalizedProducts.length) {
    return normalizedProducts.map(product => ({
      key: product.id || product.key,
      label: product.label,
      description: product.description,
      description_long: product.description_long,
      content: product.content,
      active: product.active !== false
    }));
  }

  const rawItems = category?.items || {};

  return Object.entries(rawItems)
    .filter(([, item]) => item?.active !== false)
    .map(([key, item]) => ({
      key: item.id || key,
      label: item.label,
      description: item.description,
      description_long: item.description_long,
      content: item.content,
      active: item.active !== false
    }));
}

function renderArticleEntry(entry) {
  const title = entry?.label ? translate(entry.label) : "";
  const shortDesc = translateMaybe(entry?.description);
  const longDesc = translateMaybe(entry?.description_long);
  const bodyHtml = renderArticleBody(entry?.content);

  return `
    <article class="article stack gap-m" id="${escapeHtml(entry?.key || "")}">
      ${title ? `<h2 class="menu-group-title">${escapeHtml(title)}</h2>` : ""}
      ${shortDesc ? `<p class="article-lead">${escapeHtml(shortDesc)}</p>` : ""}
      ${bodyHtml || longDesc ? `
        <div class="article-body">
          ${bodyHtml || `<p>${escapeHtml(longDesc)}</p>`}
        </div>
      ` : ""}
    </article>
  `;
}

function renderArticleBody(content) {
  if (!content) return "";

  // Case 1: content là string nhiều dòng
  const translatedString = translateMaybe(content);
  if (typeof translatedString === "string" && translatedString.trim()) {
    return translatedString
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => `<p>${escapeHtml(line)}</p>`)
      .join("");
  }

  // Case 2: content là mảng block / đoạn văn
  if (Array.isArray(content)) {
    return content
      .map(renderContentBlock)
      .filter(Boolean)
      .join("");
  }

  return "";
}

function renderContentBlock(block) {
  if (!block) return "";

  // Nếu block chỉ là object ngôn ngữ {vi,en}
  const directText = translateMaybe(block);
  if (typeof directText === "string" && directText.trim()) {
    return `<p>${escapeHtml(directText)}</p>`;
  }

  // Nếu block có type riêng
  const type = block?.type || "text";
  const text = translateMaybe(block?.content || block);

  if (!text || typeof text !== "string" || !text.trim()) return "";

  switch (type) {
    case "title":
      return `<h3 class="article-subtitle">${escapeHtml(text)}</h3>`;

    case "highlight":
      return `<p class="article-highlight">${escapeHtml(text)}</p>`;

    case "quote":
      return `<blockquote class="article-quote">${escapeHtml(text)}</blockquote>`;

    default:
      return `<p>${escapeHtml(text)}</p>`;
  }
}

function translateMaybe(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  try {
    const translated = translate(value);
    return typeof translated === "string" ? translated : "";
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}