// ui/render/renderCategory.js

import { MENU } from "../../core/menuStore.js";
import { addToCart, sendInstant } from "../../core/events.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";
import { openPicker } from "../components/placePicker.js"
import { renderCategoryNew } from "./themeCategory.js";


export function renderCategory(key){

  const contentEl = document.querySelector(".category-panel");
  if(!contentEl) return;

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
      contentEl.innerHTML = renderCommon(category, key);
      break;

    case "cart":
      contentEl.innerHTML = renderCommon(category, key);
      break;
  }

  contentEl.onclick = e => {
    const Btn = e.target.closest("button[data-ui]");
    if (!Btn) return;
  
    const payload = {
      ui: Btn.dataset.ui,
      category: Btn.dataset.category,
      item: Btn.dataset.item,
      option: Btn.dataset.option,
      qty: 1
    };

    dispatchAction(payload);
  };
}

function dispatchAction(payload) {
  if(!ensureActive()) return;
  if(payload.ui==="instant"){
    sendInstant(payload);
  }
  if(payload.ui==="cart"){
    addToCart(payload);
  }
}
/* ========================================================= */

function ensureActive(){
  const ctx = getContext();
  if(!ctx?.active){
    openPicker();
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

function renderCommon(group, groupKey) {
  const type = group.ui;
  const Group = Object.entries(group.items)
  .filter(([, item]) => item.active !== false);
  return Group.map(([itemKey, item]) => {
      const Title = translate(item.label);
      const cards = Object.entries(item.options || {})
      .filter(([, opt]) => opt.active !== false)
      .map(([optKey, opt]) => {
        return categoryOpt(opt, optKey, itemKey, groupKey, type, optKey===item.recommend);
      }).join("");
      return `
        <div class="menu-group">
          <h2 class="menu-group-title">${Title}</h2>
          <div class="menu-grid grid">
            ${cards}
          </div>
        </div>
      `;
    }).join("");
}