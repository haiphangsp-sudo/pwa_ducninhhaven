//  

import { addToCart, sendInstant } from "../../core/events.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { getCategoryType, getItems } from "../../data/helpers.js"

export function renderCategory(key){
  const contentEl = document.querySelector(".category-panel");
  switch(getCategoryType(key)){

    case "article":
      contentEl.innerHTML = renderArticle(category);
      break;

    case "instant":
      contentEl.innerHTML = renderInstant(key);
      break;

    case "cart":
      contentEl.innerHTML = renderCartPanel(key);
      break;
  }
  contentEl.onclick = e => {
    const instanBtn = e.target.closest(".instant-btn");
    if(instanBtn){
      if(!ensureActive()) return;

      sendInstant({
        qty: 1,
        category: instanBtn.dataset.category,
        code: instanBtn.dataset.item
      });
    }
    const orderBtn = e.target.closest(".order-btn");
    if(orderBtn){
      if(!ensureActive()) return;

      addToCart({
        category: orderBtn.dataset.category,
        item: orderBtn.dataset.item,
        option: orderBtn.dataset.option
      });
    }
  };

}

/* ========================================================= */

function ensureActive(){

  const ctx = getContext();

  if(!ctx?.active){
    window.dispatchEvent(new Event("openPlacePicker"));
    return false;
  }

  return true;
}

/* ========================================================= */
/* ARTICLE */

function renderArticle(categoryKey){
  const Item = getItems(categoryKey);
  return Item
    .filter(sec=>sec.active!==false)
    .map(section=>{

      const title = translate(section.label);

      const body = Array.isArray(section.content)
        ? section.content.map(p=>`<p>${translate(p)}</p>`).join("")
        : `<p>${translate(section.content)}</p>`;

      return `
        <article class="article">
          <h2>${title}</h2>
          ${body}
        </article>
      `;
    }).join("");
}

/* ========================================================= */
/* INSTANT */

function renderInstant(categoryKey){
  const Item = getItems(categoryKey);
  return `
    <div class="instant-panel">
      ${
        Item
        .filter(([,item])=>item.active!==false)
        .map(([itemKey,item])=>{
          const title = translate(item.label);
          const desc  = item.description ? translate(item.description) : "";
          return `
            <div class="instant-card card row">
              <div class="stack">
                <div class="card-title service-${itemKey}">${title}</div>
                ${desc ? `<div class="card-desc">${desc}</div>` : ""}
              </div>
                <div class="card-bottom">
                  <button class="instant-btn btn btn-primary"
                    data-category="${categoryKey}"
                    data-item="${itemKey}">
                    ${translate("send_request")}
                  </button>
                </div>            
            </div>
          `;
        }).join("")
      }
    </div>
  `;
}

/* ========================================================= */
/* CART */

function renderCartPanel(categoryKey){
  const Item = getItems(categoryKey);
  return Item
    .filter(([,item])=>item.active!==false)
    .map(([itemKey,item])=>{

      const groupTitle = translate(item.label);

      const cards = Object.entries(item.options || {})
        .filter(([,opt])=>opt.active!==false)
        .map(([optKey,opt])=>{

          const title = translate(opt.label);
          const desc  = opt.description ? translate(opt.description) : "";
          const price = opt.price || 0;
          const formatPrice = new Intl.NumberFormat("vi-VN");

          return `
            <div class="menu-card card">
              <div class="card-title">${title}</div>
              ${desc ? `<div class="card-desc">${desc}</div>` : ""}
              <div class="card-bottom">
                <div class="menu-price price">
                  ${formatPrice.format(price)} đ
                </div>
                <button class="order-btn btn btn-primary"
                  data-category="${categoryKey}"
                  data-item="${itemKey}"
                  data-option="${optKey}">
                  ${translate("cart_bar.order")}
                </button>
              </div>
            </div>
          `;

        }).join("");

      return `
        <div class="menu-group">
          <h2 class="menu-group-title">${groupTitle}</h2>
          <div class="menu-grid grid">
            ${cards}
          </div>
        </div>
      `;

    }).join("");
}
