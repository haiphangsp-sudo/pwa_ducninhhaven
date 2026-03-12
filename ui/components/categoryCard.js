// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";

export function categoryCard(opt,optKey,itemKey,categoryKey) {

    
    const title = translate(opt.label);
    const desc  = opt.description ? translate(opt.description) : "";
    const price = opt.price || 0;

    return `
        <div class="menu-card card">
        <div class="card-title">${title}</div>
        ${desc ? `<div class="card-desc">${desc}</div>` : ""}
        <div class="card-bottom">
        <div class="menu-price price">
            ${price.toLocaleString("vi-VN")} đ
        </div>
        <button class="order-btn btn btn-primary"
            data-category="${categoryKey}"
            data-item="${itemKey}"
            data-option="${optKey}">
            ${translate("cart_bar.order")}
        </button>
        </div>
    </div>`;

}
