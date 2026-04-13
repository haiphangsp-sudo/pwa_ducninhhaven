import { translate } from "../utils/translate.js";
import { getVariants } from "../../core/menuQuery.js";

export function categoryOpt(categoryKey, productKey, ui) {
  const variants = getVariants(categoryKey, productKey);

  return variants.map(variant => {
    const isRecommend = variant.recommend;
    const hasLongDesc = !!variant.description_long;

    return `
      <div class="card ${ui}">
        <div class="stack menu-cart__info">
          <div data-service="${variant.key}" class="menu-card__title ${isRecommend ? "is-default" : ""}">
            ${translate(variant.label)}
          </div>

          <div class="card-desc menu-cart__desc">
            ${variant.description ? translate(variant.description) : ""}
          </div>

          ${hasLongDesc ? `
            <button
              class="btn-link menu-card__more"
              data-action="open-overlay"
              data-value="itemDetail"
              data-option="${variant.id}"
              data-extra="menu">
              ${translate("menu.detail")}
            </button>
          ` : ""}
        </div>

        <div class="row menu-cart__action card-bottom">
          <div class="price">${variant.price}</div>
          <button class="btn btn-primary btn-add"
            data-action="${ui === "cart" ? "add_cart" : "buy_now"}"
            data-extra="${categoryKey}"
            data-option="added"
            data-value="${variant.id}">
            ${(ui === "cart")
              ? "+ " + translate("cart_bar.add_to_order")
              : "⚡ " + translate("cart_bar.send_request")
            }
          </button>
        </div>
      </div>
    `;
  }).join("");
}