import { MENU } from "../core/menuStore.js";
import { actionAddToCart, actionSendInstant } from "../core/dispatcher.js";
import { translate } from "./utils/translate.js";

/* ========================================================= */

export function renderCategory(root, key){

  const category = MENU[key];

  if(!category || category.active===false){
    root.innerHTML="";
    return;
  }

  root.innerHTML="";

  switch(category.type){
    case "article": return renderArticle(root, category);
    case "instant": return renderInstant(root, category);
    case "cart":    return renderCartPanel(root, category, key);
  }
}

/* ========================================================= */

function renderArticle(root, category){

  root.innerHTML = Object.values(category.items || {})
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

function renderInstant(root, category){

  root.innerHTML = Object.entries(category.items || {})
    .filter(([,item])=>item.active!==false)
    .map(([key,item])=>`
      <button class="instant-btn" data-key="${key}">
        ${translate(item.label)}
      </button>
    `).join("");

  root.querySelectorAll(".instant-btn").forEach(btn=>{
    btn.onclick=()=>actionSendInstant(btn.dataset.key);
  });
}

/* ========================================================= */

function renderCartPanel(root, category, categoryKey){

  root.innerHTML = Object.entries(category.items || {})
    .filter(([,item])=>item.active!==false)
    .map(([itemKey,item])=>{

      const title = translate(item.label);

      const options = Object.entries(item.options || {})
        .map(([optKey,opt])=>`
          <button class="option-btn ${opt.active===false?"disabled":""}"
            data-category="${categoryKey}"
            data-item="${itemKey}"
            data-option="${optKey}"
            ${opt.active===false?"disabled":""}>
            ${translate(opt.label)}
          </button>
        `).join("");

      return `
        <div class="menu-item">
          <div class="item-title">${title}</div>
          <div class="item-options">${options}</div>
        </div>
      `;

    }).join("");

  root.querySelectorAll(".option-btn:not(.disabled)").forEach(btn=>{
    btn.onclick=()=>{
      actionAddToCart({
        category:btn.dataset.category,
        item:btn.dataset.item,
        option:btn.dataset.option
      });
    };
  });
}