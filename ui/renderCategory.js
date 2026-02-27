// ui/renderCategory.js

import { MENU } from "../data/menu.js";
import { actionAddToCart, actionSendInstant } from "../core/dispatcher.js";
import { translate } from "./utils/translate.js";

/* =========================================================
 ENTRY
========================================================= */

export function renderCategory(root, key){

  const category = MENU[key];
  if(!category){
    root.innerHTML="";
    return;
  }

  root.innerHTML="";

  // article có content
  const firstItem = Object.values(category.items || {})[0];

  if(firstItem?.content !== undefined)
    return renderArticle(root, category);

  // instant: không có options
  if(!firstItem?.options)
    return renderInstant(root, category);

  // còn lại = cart
  return renderCartPanel(root, category, key);
}

/* =========================================================
 ARTICLE PANEL (intro / info)
========================================================= */

function renderArticle(root, category){

  root.innerHTML = Object.values(category.items).map(section=>{

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

/* =========================================================
 INSTANT PANEL (service / help)
========================================================= */

function renderInstant(root, category){

  root.innerHTML = Object.entries(category.items).map(([key,item])=>`
    <button class="instant-btn" data-key="${key}">
      ${translate(item.label)}
    </button>
  `).join("");

  root.querySelectorAll(".instant-btn").forEach(btn=>{
    btn.onclick=()=>actionSendInstant(btn.dataset.key);
  });
}

/* =========================================================
 CART PANEL (food / drink)
 schema:
 category
   └ item
       └ options[]
========================================================= */

function renderCartPanel(root, category, categoryKey){

  root.innerHTML = Object.entries(category.items).map(([itemKey,item])=>{

    const title = translate(item.label);

    const options = (item.options || []).map(opt=>`
      <button class="option-btn"
        data-category="${categoryKey}"
        data-item="${itemKey}"
        data-option="${opt}">
        ${formatOption(opt)}
      </button>
    `).join("");

    return `
      <div class="menu-item">
        <div class="item-title">${title}</div>
        <div class="item-options">${options}</div>
      </div>
    `;

  }).join("");

  root.querySelectorAll(".option-btn").forEach(btn=>{
    btn.onclick=()=>{
      actionAddToCart({
        category:btn.dataset.category,
        item:btn.dataset.item,
        option:btn.dataset.option
      });
    };
  });
}

/* =========================================================
 Helpers
========================================================= */

function formatOption(opt){
  if(!opt) return "";
  return opt.charAt(0).toUpperCase()+opt.slice(1);
}