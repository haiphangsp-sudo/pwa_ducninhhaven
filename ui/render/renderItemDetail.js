import { getVariantDetailById } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";

export function renderItemDetail(state) {
  const overlayValue = state.overlay?.value;
  const detail = getVariantDetailById(overlayValue);

  if (!detail) {
    return `
      <div class="item-detail">
        <div class="item-detail__header">
          <h2 class="item-detail__title">...</h2>
          <button class="item-detail__close" data-action="close-overlay" data-value="">×</button>
        </div>
        <div class="item-detail__body">
          <p>${translate("received.vi") ? "" : "Đang cập nhật..."}</p>
        </div>
      </div>
    `;
  }

  const body = detail.descriptionLong || detail.description;

  return `
    <div class="item-detail">
      <div class="item-detail__header">
        <div class="stack gap-s">
          <div class="item-detail__eyebrow">${detail.productLabel}</div>
          <h2 class="item-detail__title">${detail.variantLabel}</h2>
        </div>
        <button class="item-detail__close" data-action="close-overlay" data-value="">×</button>
      </div>

      <div class="item-detail__body">
        ${renderParagraphs(body)}
      </div>

      <div class="item-detail__footer">
        <div class="item-detail__price">${detail.priceFormat}</div>
        <button class="btn btn-primary"
          data-action="${detail.ui === "cart" ? "add_cart" : "buy_now"}"
          data-option="added"
          data-value="${detail.id}">
          ${detail.ui === "cart"
            ? "+ " + translate("cart_bar.add_to_order")
            : "⚡ " + translate("cart_bar.send_request")}
        </button>
      </div>
    </div>
  `;
}

function renderParagraphs(text = "") {
  if (!text || typeof text !== "string") return "";

  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}