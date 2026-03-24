// ui/components/categoryCard.js

import { translate } from "../utils/translate.js";
import { dispatchAction } from "../../core/events.js";

/* =========================
   PUBLIC
========================= */

export function categoryOpt(opt, itemKey, categoryKey, type) {
    
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
                    data-action="${type}"
                    data-category="${categoryKey}"
                    data-item="${itemKey}"
                    data-value="${opt.key}">
                    ${type==="cart" ? `+ ` + translate("cart_bar.add_to_order") : `⚡ ` + translate("cart_bar.send_request")}
                </button>
            </div>
        </div>`;

}
// KHỞI TẠO SỰ KIỆN (Gán một lần duy nhất hoặc đảm bảo tính nhất quán)

export function attachMenuEvents(){
  document.addEventListener("click", e => {
  
    const btn = e.target.closest(".category-panel button[data-option]");
    if(!btn) return;

    dispatchAction({
      mode: btn.dataset.action,
      category: btn.dataset.category,
      item: btn.dataset.item,
      option: btn.dataset.value,
      qty: 1
    });
      
    btn.classList.add("is-loading");
    setTimeout(() => btn.classList.remove("is-loading"), 500);
  });
}
