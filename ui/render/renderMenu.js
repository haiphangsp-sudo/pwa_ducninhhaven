// ui/render/renderMenu.js

import { getOptions } from "../../core/menuQuery.js";
import { translate } from "../utils/translate.js";
import { categoryOpt } from "../components/categoryOption.js";
import { dispatchAction } from "../../core/events.js"; // Đảm bảo import đúng

export function renderMenu(category) {

  const type = category.ui;
  return category.items.map(item => {
      
      const options = getOptions(category.key, item.key)
        .filter(opt => opt.active !== false); // 1. Lấy và lọc các Option con đang active

      if (options.length === 0) return ""; // 2. NẾU KHÔNG CÓ OPTION NÀO ACTIVE -> KHÔNG VẼ NHÓM NÀY
      const cards = options
        .map(opt => {
          const isRecommend = Array.isArray(item.recommend) && item.recommend.includes(opt.key);
          return categoryOpt({ ...opt, recommend: isRecommend }, item.key, category.key, type);
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

export function attachMenuEvents(){
  document.addEventListener("click", e => {
  
    const btn = e.target.closest(".category-panel button[data-option]");
    if(!btn) return;

    dispatchAction({
      type: btn.dataset.ui,
      category: btn.dataset.category,
      item: btn.dataset.item,
      option: btn.dataset.option,
      qty: 1
    });

    const bar = document.getElementById("cartBar");
    bar?.classList.add("cart-bounce");

    setTimeout(() => {
      bar?.classList.remove("cart-bounce");
    }, 400);
  });
}