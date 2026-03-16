// ui/render/renderMenu.js

import { getCategory, getOptions } from "../../core/menuQuery.js";
import { addToCart, sendInstant } from "../../core/events.js";
import { getContext } from "../../core/context.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";
import { openPicker } from "../components/placePicker.js";

export function renderMenu(key){

    const category = getCategory(key);
    if(!category) return;

    const type = category.ui;

    return category.items.map(item => {

        const title = translate(item.label);
        const options = getOptions(category.key, item.key);

        const cards = options.map(opt => {
            return categoryOpt(opt, item.key, category.key, type)
        }).join("");
    
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

  });

  
  document.querySelector(".category-panel").onclick = e => {

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
function dispatchAction(payload) {
  if(!ensureActive()) return;
  if(payload.ui==="instant"){
    sendInstant(payload);
  }
  if(payload.ui==="cart"){
    addToCart(payload);
  }
}
function ensureActive(){
  const ctx = getContext();
  if(!ctx?.active){
    openPicker();
    return false;
  }
  return true;
}