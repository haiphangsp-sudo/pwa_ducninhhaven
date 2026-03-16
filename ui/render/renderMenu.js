// ui/render/renderMenu.js

import { getOptions } from "../../core/menuQuery.js";
import { addToCart, sendInstant } from "../../core/events.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";
import { openPicker } from "../components/placePicker.js";

export function renderMenu(category){

  const container = document.getElementById("hubContent");
  if(!container) return;

  const type = category.ui;

  const html = category.items.map(item => {

    const title = translate(item.label);

    const options = getOptions(category.key,item.key);

    const cards = options.map(opt =>
      categoryOpt(opt,item.key,category.key,type)
    ).join("");

    return `
      <div class="menu-group">

        <h2 class="menu-group-title">
          ${title}
        </h2>

        <div class="menu-grid grid">
          ${cards}
        </div>

      </div>
    `;

  }).join("");

  container.innerHTML = html;

  container.onclick = e => {

    const Btn = e.target.closest("button[data-ui]");
    if(!Btn) return;

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

/* ACTION ROUTER */

function dispatchAction(payload){

  if(!ensureActive()) return;

  if(payload.ui==="instant"){
    sendInstant(payload);
  }

  if(payload.ui==="cart"){
    addToCart(payload);
  }
}

/* CONTEXT CHECK */

function ensureActive(){

  const ctx = getContext();

  if(!ctx?.active){
    openPicker();
    return false;
  }

  return true;
}