// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";

export function categoryOpt(opt, optKey, itemKey, categoryKey, type, Recommended) {
    
    const title = translate(opt.label);
    const desc = opt.description ? translate(opt.description) : "";
    const price = opt.price;

    return `
        <div class="card">
            <div class="stack menu-cart__info">
                <div class="card-title service-${optKey} menu-card__title ${Recommended ? "is-default" : ""}">${title}</div>
                ${desc ? `<div class="card-desc menu-cart__desc">${desc}</div>` : ""}
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
                    data-ui="${type}"
                    data-category="${categoryKey}"
                    data-item="${itemKey}"
                    data-option="${optKey}">
                    ${type==="cart"?translate("cart_bar.order"):translate("send_request")}
                </button>
            </div>
        </div>`;

}
