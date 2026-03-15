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
  
    const data = Btn.dataset;
    if(data.ui==="instant"){
      if(!ensureActive()) return;

      sendInstant({
        qty: 1,
        category: Btn.dataset.category,
        code: Btn.dataset.item
      });
    }
    if(data.ui==="cart"){
      if(!ensureActive()) return;
      addToCart({
        category: Btn.dataset.category,
        item: Btn.dataset.item,
        option: Btn.dataset.option
      });
    }
  };
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
  let Recommended = false;
  const type = group.ui;
  return Object.entries(group.items)
    .filter(([, item]) => item.active !== false)
    .map(([itemKey, item]) => {
      const Title = translate(item.label);
      const cards = Object.entries(item.options || {});
      cards.filter(([, opt]) => opt.active !== false);
      const defaultKey = item.defaultOption || options[0]?.[0];
      cards.map(([optKey, opt]) => {
        if (opt === defaultKey) Recommended = true;
        return categoryOpt(opt, optKey, itemKey, groupKey, type, Recommended);
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