// ui/render/renderItemDetail.js
import { getVariantDetailById } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";

/* =========================
   PUBLIC
========================= */

export function renderItemDetail(state) {
  const host = document.getElementById("itemDetail");
  if (!host) return;

  const variantId = state.overlay?.value;
  const detail = getVariantDetailById(variantId);

  if (!detail) {
    host.innerHTML = `
      <div class="item-detail">
        <div class="item-detail__header">
          <div class="stack gap-s">
            <div class="item-detail__eyebrow">...</div>
            <h2 class="item-detail__title">...</h2>
          </div>
          <button class="item-detail__close" data-action="close-overlay" aria-label="Close">×</button>
        </div>

        <div class="item-detail__body">
          <p>Đang cập nhật nội dung...</p>
        </div>
      </div>
    `;
    return;
  }

  const actionLabel =
    detail.ui === "cart"
      ? `+ ${translate("cart_bar.add_to_order")}`
      : `⚡ ${translate("cart_bar.send_request")}`;

  host.innerHTML = `
    <div class="item-detail">

      ${renderMedia(detail)}

      <div class="item-detail__header">
        <div class="stack gap-s">
          ${detail.productLabel
            ? `<div class="item-detail__eyebrow">${escapeHtml(detail.productLabel)}</div>`
            : ""}
          <h2 class="item-detail__title">${escapeHtml(detail.variantLabel || "")}</h2>
        </div>

        <button
          class="item-detail__close"
          data-action="close-overlay"
          aria-label="Close">
          ×
        </button>
      </div>

      <div class="item-detail__body">
        ${renderBody(detail)}
        ${renderNote(detail)}
      </div>

      <div class="item-detail__footer">
        <div class="item-detail__price">${escapeHtml(detail.priceFormat || "")}</div>

        <button
          class="btn btn-primary"
          data-action="${detail.ui === "cart" ? "add_cart" : "buy_now"}"
          data-option="added"
          data-value="${detail.id}">
          ${actionLabel}
        </button>
      </div>
    </div>
  `;
}

/* =========================
   PRIVATE
========================= */

function renderMedia(detail) {
  if (!detail?.image) return "";

  return `
    <div class="item-detail__media">
      <img
        src="${escapeHtml(detail.image)}"
        alt="${escapeHtml(detail.variantLabel || detail.productLabel || "item")}"
        loading="lazy"
      />
    </div>
  `;
}

function renderBody(detail) {
  const longText = detail?.descriptionLong || "";
  const shortText = detail?.description || "";
  const text = longText || shortText;

  if (!text) return "";

  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function renderNote(detail) {
  const note = detail?.note || "";
  if (!note) return "";

  return `
    <div class="item-detail__note">
      ${escapeHtml(note)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}