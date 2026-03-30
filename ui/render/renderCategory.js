// ui/render/renderMenu.js

import { getVariants, getProducts} from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";

export function renderMenu(categoryKey) {

  const products = getProducts(categoryKey);
  if (!products.length ) return "";

  return products.map(product => {
    const ui = product.ui;
    const productKey = product.key;
    const variants = getVariants(categoryKey, productKey);
    const cards = variants.map(variant => {
      return categoryOpt({ ...variant },categoryKey, productKey,ui);
      }).join("");
    return `
        <section class="menu-group">
          <h2 class="menu-group-title">
            ${translate(product.label)}
          </h2>
          <div class="menu-grid grid">
            ${cards}
          </div>
        </section>
      `;
    }).join("");
}

