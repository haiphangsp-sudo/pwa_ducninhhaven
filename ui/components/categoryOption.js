// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";

/* =========================
   PUBLIC
========================= */

export function categoryOpt(opt, categoryKey, productKey) {

    const price = opt.price;
    const isRecommend = opt.recommend;
    const ui = opt.ui;

    return `
        <div class="card">
            <div class="stack menu-cart__info">
                <div data-service="${ui}" class="menu-card__title ${isRecommend ? "is-default" : ""}">
                ${translate(opt.label)}
                </div>           
                <div class="card-desc menu-cart__desc">
                    ${opt.description ?  translate(opt.description) : ""}
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
                    data-action="${(ui==="cart")?"add-cart":"send-instant"}"
                    data-extra="${categoryKey}"
                    data-option="${productKey}"
                    data-value="${opt.id}">
                    ${(ui === "cart")
                        ? "+ " + translate("cart_bar.add_to_order")
                        : "⚡ " + translate("cart_bar.send_request")
                    }
                </button>
            </div>
        </div>`;

}

