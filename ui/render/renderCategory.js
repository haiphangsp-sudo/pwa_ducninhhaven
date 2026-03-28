// ui/render/renderMenu.js

import { getVariants, getProducts} from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";

export function renderMenu(categoryKey,type) {

  const products = getProducts(categoryKey);
  if (products.length === 0) return "";

  return products.map(product => {
    const productKey = product.key;
    const variants = getVariants(categoryKey, productKey);
    const cards = variants.map(variant => {
        const isRecommend = variant.recommend;
        return categoryOpt(variant.key,categoryKey, productKey, isRecommend, type );
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

