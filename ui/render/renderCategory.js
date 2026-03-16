// ui/render/renderCategory.js

import { getCategory, getOptions} from "../../core/menuQuery.js";
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

  const items = category.items || {}

  const parts = []

  for (const key in items){

    if (!Object.hasOwn(items,key)) continue

    const section = items[key]

    if(section.active === false) continue

    const title = translate(section.label)

    const content = Array.isArray(section.content) ? section.content : [section.content]
    const body = content
      .filter(Boolean)
      .map(p => `<p class="card-desc">${translate(p)}</p>`)
      .join("")

    parts.push(`
      <div class="card">
        <article class="article">
          <h2 class="card-title">${title}</h2>
          ${body}
        </article>
      </div>
    `)

  }

  return parts.join("")
}

/* ========================================================= */
/* INSTANT */

function renderCommon(group) {
  const type = group.ui;
  return group.items.map(item => {
    const title = translate(item.label);
    const options = getOptions(group.key, item.key)
    const cards = options.map(opt => {
        return categoryOpt(opt, item.key, group.key, type, item.recommend===group.key);
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