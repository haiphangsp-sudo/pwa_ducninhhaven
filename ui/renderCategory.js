
// ui/renderCategory.js
// Render nội dung bên trong category khi chọn tab ở menu dưới cùng


import { MENU } from "../core/menuStore.js";
import { addToCart, sendInstant } from "../core/actions.js";
import { getContext } from "../core/context.js";
import { translate } from "./utils/translate.js";

/* ========================================================= */

export function renderCategory(root, key){

  const category = MENU[key];
  if(!category){
    root.innerHTML="";
    return;
  }

  root.innerHTML="";
  
  switch(category.ui){

    case "article":
      return renderArticle(root, category);

    case "instant":
      return renderInstant(root, category, key);

    case "cart":
      return renderCartPanel(root, category, key);

    default:
      root.innerHTML="";
  }
}

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

function renderArticle(root, category){

  root.innerHTML = Object.values(category.items)
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

function renderInstant(root, category, categoryKey){

  root.innerHTML = Object.entries(category.items)
    .filter(([,item])=>item.active!==false)
    .map(([itemKey,item])=>`
      <button class="instant-btn"
              data-category="${categoryKey}"
              data-item="${itemKey}">
        ${translate(item.label)}
      </button>
    `).join("");

  root.querySelectorAll(".instant-btn").forEach(btn=>{

    btn.onclick=()=>{

      if(!ensureActive()) return;
      
      sendInstant({
        qty: 1,
        type: category.ui,
        category: btn.dataset.category,
        code: btn.dataset.item
      });
    };

  });
}

/* ========================================================= */

function renderCartPanel(root, category, categoryKey){

  root.innerHTML = Object.entries(category.items || {})
    .filter(([,item])=>item.active!==false)
    .map(([itemKey,item])=>{

      const groupTitle = translate(item.label);
      const Order = translate("order");
      const cards = Object.entries(item.options || {})
        .filter(([,opt])=>opt.active!==false)
        .map(([optKey,opt])=>{

          const title = translate(opt.label);
          const desc  = opt.description ? translate(opt.description) : "";
          const price = opt.price ? opt.price : "";

          return `
            <div class="menu-card"
                 data-category="${categoryKey}"
                 data-item="${itemKey}"
                 data-option="${optKey}">

              <div class="menu-title">${title}</div>

              <div class="menu-desc">${desc}</div>

              <div class="menu-price">${price} đ</div>

              <button class="order-btn"
                      data-category="${categoryKey}"
                      data-item="${itemKey}"
                      data-option="${optKey}">
                ${Order}
              </button>

            </div>
          `;
        }).join("");

      return `
        <div class="menu-group">

          <h2 class="menu-group-title">
            ${groupTitle}
          </h2>

          <div class="menu-grid">
            ${cards}
          </div>

        </div>
      `;

    }).join("");

  root.querySelectorAll(".order-btn").forEach(btn=>{

    btn.onclick=()=>{

      if(!ensureActive()) return;

      addToCart({
        category: btn.dataset.category,
        item: btn.dataset.item,
        option: btn.dataset.option
      });

    };

  });

}
