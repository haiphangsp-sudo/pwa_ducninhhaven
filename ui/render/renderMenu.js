// ui/render/renderMenu.js

import { getProducts} from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
//import { categoryOpt } from "../components/categoryOption.js";
import { categoryOpt } from "../components/categoryCard.js";


export function renderMenu(categoryKey,ui) {

  const products = getProducts(categoryKey);
  if (!products.length ) return "";

  return products.map(product => {
    const productKey = product.key;
    const optionsHtml = categoryOpt(categoryKey, product.key, ui);
    if(!optionsHtml) return "";
    return `
        <section class="menu-group">
          <h2 class="menu-group-title">
            ${translate(product.label)}
          </h2>
          <div class="menu-grid grid">
            ${optionsHtml}
          </div>
        </section>
      `;
    }).join("");
}
