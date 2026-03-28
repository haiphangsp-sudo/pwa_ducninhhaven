// ui/render/renderMenu.js

import { getVariants } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";

export function renderMenu(products) {

  const type = products.ui;
  return products.items.map(product => {
    const categoryKey = products.key;
    const productKey = product.key;
    const variants = getVariants(categoryKey, productKey);

      const cards = variants.map(variant => {
        const isRecommend = variant.recommend;
        const variantKey = variant;
        return categoryOpt(categoryKey, productKey, variantKey, isRecommend, type );
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

