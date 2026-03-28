// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";

/* =========================
   PUBLIC
========================= */

export function categoryOpt(categoryKey, productKey, variantKey, isRecommend, type ) {
    if (!variantKey) return;

    const price = variantKey.price;

    return `
        <div class="card">
            <div class="stack menu-cart__info">
                <div data-service="${type}" class="menu-card__title ${isRecommend ? "is-default" : ""}">
                ${translate(variantKey.label)}
                </div>           
                <div class="card-desc menu-cart__desc">
                      ${variantKey.desc ?  translate(variantKey.desc) : ""}
                </div>
            </div>
            <div class="row menu-cart__action card-bottom">
                <div class="price">
                    ${price > 0
                        ? price.toLocaleString("vi-VN") + " đ"
                        : price === 0 ? translate("cart_bar.free")
                        : translate("cart_bar.instant")
                    }
                </div>
                <button class="btn btn-primary"
                    data-action="${type}"
                    data-category="${categoryKey}"
                    data-item="${productKey}"
                    data-option="${variantKey}"
                    data-option-id="${variantKey.id}">
                    ${type === "cart"
                        ? "+ " + translate("cart_bar.add_to_order")
                        : "⚡ " + translate("cart_bar.send_request")
                    }
                </button>
            </div>
        </div>`;

}

