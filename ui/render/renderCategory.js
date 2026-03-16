// ui/render/renderCategory.js

import { getArticle,getCategory, getOptions} from "../../core/menuQuery.js";
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
import { getArticle } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";

 function renderIntro(panel){

  const contentEl = document.querySelector(".category-panel");

  const article = getArticle(panel);
  if(!article){
    contentEl.innerHTML = "";
    return;
  }

  const html = `
    <section class="intro">

      <h1 class="intro-title">
        ${translate(article.label)}
      </h1>

      <div class="intro-body">

        ${article.items.map(item=>`

          <article class="intro-block">

            <h3 class="intro-block-title">
              ${translate(item.label)}
            </h3>

            <p class="intro-block-text">
              ${translate(item.content)}
            </p>

          </article>

        `).join("")}

      </div>

    </section>
  `;

  contentEl.innerHTML = html;

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