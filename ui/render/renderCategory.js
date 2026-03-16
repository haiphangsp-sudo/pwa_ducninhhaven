// ui/render/renderCategory.js

import { getArticleContent,getCategory, getOptions} from "../../core/menuQuery.js";
import { addToCart, sendInstant } from "../../core/events.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";
import { openPicker } from "../components/placePicker.js"


export function renderCategory(key){

  const contentEl = document.querySelector(".category-panel");
  if(!contentEl) return;

  const category = getCategory(key);

  if(!category){
    contentEl.innerHTML="";
    return;
  }

  if (category.ui === "article") {
    contentEl.innerHTML = renderArticle(category);
  }else{
      contentEl.innerHTML = renderCommon(category, key);
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
        ? section.content : [];
      const paragraphs = body
        .map(text =>`<p class="card-desc">${translate(section.content)}</p>`)
          .join("");
      return `
      <div class="card">
        <article class="article">
          <h2 class="card-title">${title}</h2>
          ${paragraphs}
        </article>
        </div>
      `;
    }).join("");
}
/* ========================================================= */
/* INSTANT */

function renderCommon(group) {
  const type = group.ui;
  return group.items.map(item => {
    const title = translate(item.label);
    const options = getOptions(group.key, item.key)
    const cards = options.map(opt => {
        return categoryOpt(opt, item.key, group.key, type);
      }).join("");
      return `
        <div class="menu-group">
          <h2 class="menu-group-title">${title}</h2>
          <div class="menu-grid grid">
            ${cards}
          </div>
        </div>
      `;
    }).join("");
}