import { getVariantDetailById } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";

/* =========================
   PUBLIC
========================= */

export function renderItemDetail(state) {
  const host = document.getElementById("overlayContent");
  if (!host) return;

  const variantId = state.overlay?.value;
  const detail = getVariantDetailById(variantId);

  // fallback
  if (!detail) {
    host.innerHTML = `
      <div class="item-detail">
        <div class="item-detail__header">
          <h2 class="item-detail__title">...</h2>
          <button class="item-detail__close" data-action="close-overlay">×</button>
        </div>
        <div class="item-detail__body">
          <p>Đang cập nhật nội dung...</p>
        </div>
      </div>
    `;
    return;
  }

  const body = detail.descriptionLong || detail.description;

  host.innerHTML = `
    <div class="item-detail">

      <!-- HEADER -->
      <div class="item-detail__header">
        <div class="stack gap-s">
          <div class="item-detail__eyebrow">${detail.productLabel}</div>
          <h2 class="item-detail__title">${detail.variantLabel}</h2>
        </div>
        <button class="item-detail__close" data-action="close-overlay">×</button>
      </div>

      <!-- BODY -->
      <div class="item-detail__body">
        ${renderParagraphs(body)}
      </div>

      <!-- FOOTER -->
      <div class="item-detail__footer">
        <div class="item-detail__price">${detail.priceFormat}</div>

        <button class="btn btn-primary"
          data-action="${detail.ui === "cart" ? "add_cart" : "buy_now"}"
          data-option="added"
          data-value="${detail.id}">
          ${
            detail.ui === "cart"
              ? "+ " + translate("cart_bar.add_to_order")
              : "⚡ " + translate("cart_bar.send_request")
          }
        </button>
      </div>

    </div>
  `;
}

/* =========================
   PRIVATE
========================= */

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