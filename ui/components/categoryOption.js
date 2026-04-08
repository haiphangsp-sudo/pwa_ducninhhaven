// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";
import { getVariants } from "../../core/menuQuery.js";

/* =========================
   PUBLIC
========================= */

export function categoryOpt(categoryKey, productKey, ui) {
    const variants = getVariants(categoryKey, productKey);
    console.log("Variants found:", variants)
    return variants.map(variant => {       
        const isRecommend = variant.recommend;
        return `
        <div class="card ${ui}">
            <div class="stack menu-cart__info">
                <div data-service="${variant.key}" class="menu-card__title ${isRecommend ? "is-default" : ""}">
                ${translate(variant.label)}
                </div>           
                <div class="card-desc menu-cart__desc">
                    ${variant.description ? translate(variant.description) : ""}
                </div>
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
        </div>`;
    }).join("");

}

