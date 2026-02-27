// ui/renderHome.js
//Hiển thị các nhóm dịch vụ.
import { actionSelectCategory } from "../core/dispatcher.js";
import { getCategoriesForMode } from "../data/helpers.js";
import { UI } from "../core/state.js";
import { translate } from "./utils/translate.js";

export function renderHome(container){

  const categories = getCategoriesForMode(UI.context.mode);

  categories.forEach(cat=>{

    const btn = document.createElement("button");
    btn.className="card";
    btn.innerText = translate(cat.label);
    btn.onclick=()=>actionSelectCategory(cat.key);

    container.appendChild(btn);

  });
  
}