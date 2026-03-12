// ui/render/renderCategory.js

import { MENU } from "../../core/menuStore.js";
import { addToCart, sendInstant } from "../../core/events.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { categoryCard } from "../components/categoryCard.js";
import { instantCard } from "../components/instantCard.js";

export function renderCategory(key){

  const contentEl = document.querySelector(".category-panel");
  const category = MENU[key];

  if(!category){
    contentEl.innerHTML="";
    return;
  }

  switch(category.ui){

    case "article":
      contentEl.innerHTML = renderArticle(category);
      break;

    case "instant":
      contentEl.innerHTML = renderInstant(category, key);
      break;

    case "cart":
      contentEl.innerHTML = renderCartPanel(category, key);
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

function renderArticle(category){

  return Object.values(category.items)
    .filter(sec=>sec.active!==false)
    .map(section=>{

      const title = translate(section.label);

      const body = Array.isArray(section.content)
        ? section.content.map(p=>`<p class="card-desc">${translate(p)}</p>`).join("")
        : `<p class="card-desc">${translate(section.content)}</p>`;

      return `
      <div class="card">
        <article class="article">
          <h2 class="card-title">${title}</h2>
          ${body}
        </article>
        </div>
      `;
    }).join("");
}
/* ========================================================= */
/* INSTANT */

function renderInstant(category, categoryKey){

  return `
    <div class="instant-panel">
      <div class="menu-group">
      <div class="grid">
      ${
        Object.entries(category.items)
        .filter(([,item])=>item.active!==false)
        .map(([itemKey,item])=>{
      
         return instantCard(item,itemKey,categoryKey);
          
        }).join("")
      }
      </div>
    </div>
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
        .map(([optKey, opt]) => {
          
         return categoryCard(opt, optKey, itemKey, categoryKey);
          
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
/* ========================================================= */
