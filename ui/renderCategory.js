

import { MENU } from "../core/menuStore.js";
import { addToCart, sendInstant } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";

export function renderCategory(root, key){

  const category = MENU[key];
  if(!category || !root){
    root.innerHTML="";
    return;
  }
  switch(category.ui){

    case "article":
      root.innerHTML = renderArticle(category);
      break;

    case "instant":
      root.innerHTML = renderInstant(category, key);
      break;

    case "cart":
      root.innerHTML = renderCartPanel(category, key);
      break;

  }

  bindInstant();
  bindCart();
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

function renderArticle(category){

  return Object.values(category.items)
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

function renderInstant(category, categoryKey){

  return `
    <div class="instant-panel">

      ${
        Object.entries(category.items)
        .filter(([,item])=>item.active!==false)
        .map(([itemKey,item])=>{
          const title = translate(item.label);
          const desc  = item.description ? translate(item.description) : "";
          return `
            <div class="instant-card">

              <div class="instant-info">
                <div class="instant-title ${itemKey}">${title}</div>
                ${desc ? `<div class="instant-desc">${desc}</div>` : ""}
              </div>

              <button class="instant-btn"
                data-category="${categoryKey}"
                data-item="${itemKey}">
                ${translate("send_request")}
              </button>

            </div>
          `;
        }).join("")
      }

    </div>
  `;
}

/* ========================================================= */
/* CART */

function renderCartPanel(category, categoryKey){

  return Object.entries(category.items || {})
    .filter(([,item])=>item.active!==false)
    .map(([itemKey,item])=>{

      const groupTitle = translate(item.label);

      const cards = Object.entries(item.options || {})
        .filter(([,opt])=>opt.active!==false)
        .map(([optKey,opt])=>{

          const title = translate(opt.label);
          const desc  = opt.description ? translate(opt.description) : "";
          const price = opt.price || 0;

          return `
            <div class="menu-card">

              <div class="menu-title">${title}</div>

              ${desc ? `<div class="menu-desc">${desc}</div>` : ""}

              <div class="menu-bottom">

                <div class="menu-price">
                  ${price.toLocaleString("vi-VN")} đ
                </div>

                <button class="order-btn"
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

          <div class="menu-grid">
            ${cards}
          </div>

        </div>
      `;

    }).join("");
}

/* ========================================================= */
/* EVENTS */

function bindInstant(){

  document.querySelectorAll(".instant-btn").forEach(btn=>{

    btn.onclick = ()=>{

      if(!ensureActive()) return;

      sendInstant({
        qty:1,
        category:btn.dataset.category,
        code:btn.dataset.item
      });

    };

  });
}

function bindCart(){

  document.querySelectorAll(".order-btn").forEach(btn=>{

    btn.onclick = ()=>{

      if(!ensureActive()) return;

      addToCart({
        category:btn.dataset.category,
        item:btn.dataset.item,
        option:btn.dataset.option
      });

    };

  });
}