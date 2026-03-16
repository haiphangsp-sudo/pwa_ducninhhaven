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
export function renderArticle(category, key) {

  const article = getArticleContent(key)
  if (!article) return;

  const items = (article.items || [])
    .filter(item => item.active !== false);

  const html = `
  <section class="article">
  <h1 class="article__title">${translate(category.label)}</h1>
  ${items.map(item => `
    <div class="article-card">
      <h3 class="article-card__title">${translate(item.label)}</h2>
      ${item.desc ? `<p class="article-card__desc">${translate(item.desc)}</p>` : ""}
      </div>
  `).join("")}
  </section>
  `;
document.querySelector(".category-panel").innerHTML = html;
}

/* ========================================================= */
/* INSTANT */

function renderCommon(category) {
  const type = category.ui;
  return category.items.map(item => {
    const title = translate(item.label);
    const options = getOptions(category.key, item.key)
    const cards = options.map(opt => {
        return categoryOpt(opt, item.key, category.key, type, item.recommend===category.key);
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