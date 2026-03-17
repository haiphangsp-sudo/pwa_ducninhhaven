// ui/render/renderMenu.js

import { getOptions } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";
import { dispatchAction } from "../../core/events.js"; // Đảm bảo import đúng

export function renderMenu(category) {
 
  const type = category.ui;

  return category.items
    // 1. Lọc các Item chính đang active
    .filter(item => item.active !== false)
    .map(item => {
      
      // 2. Lấy và lọc các Option con đang active
      const options = getOptions(category.key, item.key)
        .filter(opt => opt.active !== false);

      // 3. NẾU KHÔNG CÓ OPTION NÀO ACTIVE -> KHÔNG VẼ NHÓM NÀY
      if (options.length === 0) return "";

      const cards = options
        .map(opt => {
          categoryOpt(opt, item.key, category.key, type, item.recommend)

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

// KHỞI TẠO SỰ KIỆN (Gán một lần duy nhất hoặc đảm bảo tính nhất quán)
const panel = document.querySelector(".category-panel");
if (panel) {
  panel.onclick = e => {
    const btn = e.target.closest("button[data-ui]");
    if (!btn) return;

    const payload = {
      ui: btn.dataset.ui,
      category: btn.dataset.category,
      item: btn.dataset.item,
      option: btn.dataset.option,
      qty: 1
    };

    dispatchAction(payload);
  };
}
