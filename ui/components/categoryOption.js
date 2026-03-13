// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";

export function categoryOpt(opt,optKey,itemKey,categoryKey,type) {

    
    const title = translate(opt.label);
    const desc  = opt.description ? translate(opt.description) : "";
    const price = opt.price;

    return `
        <div class="card">
            <div class="stack">
                <div class="card-title service-${optKey}">${title}</div>
                ${desc ? `<div class="card-desc">${desc}</div>` : ""}
            </div>
            <div class="row card-bottom">
                <div class="price">
                    ${price?(price>0?price.toLocaleString("vi-VN"):"Free"):"Hello"}
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
