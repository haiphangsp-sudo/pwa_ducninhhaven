// ui/render/renderMenu.js

import { getOptions } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";

export function renderMenu(category) {

  const type = category.ui;
  return category.items.map(item => {
      
      const options = getOptions(category.key, item.key)
        .filter(opt => opt.active !== false); // 1. Lấy và lọc các Option con đang active

      if (options.length === 0) return ""; // 2. NẾU KHÔNG CÓ OPTION NÀO ACTIVE -> KHÔNG VẼ NHÓM NÀY
      const cards = options.map(opt => {
          //const isRecommend = Array.isArray(item.recommend) && item.recommend.includes(opt.key);
          return categoryOpt(opt.id);
        })
        .join("");

      return `
        <section class="menu-group">
          <h2 class="menu-group-title">
            ${translate(item.label)}
          </h2>
          <div class="menu-grid grid">
            ${cards}
          </div>
        </section>
      `;
    }).join("");
}

