// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";
import { getItemById } from "../../core/menuQuery.js";

/* =========================
   PUBLIC
========================= */

export function categoryOpt(id) {
    const opt = getItemById(id);
    if (!opt) return "";


    const title = translate(opt.label);
    const desc = opt.description ? translate(opt.description) : "";
    const price = opt.price;
    const isRecommend = opt.recommend;  

    return `
        <div class="card">
            <div class="stack menu-cart__info">
                <div data-service="${opt.key}" class="menu-card__title ${isRecommend ? "is-default" : ""}">${title}</div>
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
                    data-action="${opt.type}"
                    data-category="${opt.category}"
                    data-item="${opt.item}"
                    data-option="${opt.option}"
                    data-option-id="${opt.id}">
                    ${opt.type==="cart" ? "+ " + translate("cart_bar.add_to_order") : "⚡ " + translate("cart_bar.send_request")}
                </button>
            </div>
        </div>`;

}

