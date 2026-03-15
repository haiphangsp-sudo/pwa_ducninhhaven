

import { MENU } from "../../core/menuStore.js";
import { translate } from "../utils/translate.js";
import { addToCart } from "../../core/events.js";
import { openOptionSheet } from "./renderOpitonSheet.js";

export function renderCategory(category){

  const el = document.getElementById("hubContent");
  el.innerHTML = "";

  const items = MENU[category].items;

  items.forEach((item,i)=>{

    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <div class="menu-card__info">

        <div class="menu-card__title">
          ${translate(item.label)}
        </div>

        <div class="menu-card__desc">
          ${translate(item.desc)}
        </div>

      </div>

      <div class="menu-card__action">

        <button 
          class="btn-add"
          data-category="${category}"
          data-item="${i}"
        >
          +
        </button>

      </div>
    `;

    el.appendChild(card);

  });

}

document.addEventListener("click", e => {

  if(!e.target.classList.contains("btn-add")) return;

  const category = e.target.dataset.category;
  const item = Number(e.target.dataset.item);

  const options = MENU[category].items[item].options;

  if(options.length === 1){

    addToCart(category,item,0);

  }else{

    openOptionSheet(category,item);

  }

});