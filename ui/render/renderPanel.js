// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

export function renderPanel(state) {
  const categoryKey = state.panel.view; 
  const container = document.querySelector(".category-panel");
  
  if (!container || !categoryKey) return;

  const ui = state.panel.option;

  switch (ui) {
    case "article":
      container.innerHTML = renderArticle(categoryKey);
      break;
    
    case "cart":
      container.innerHTML = renderMenu(categoryKey, ui);
      break;
    
    case "instant":
      container.innerHTML = renderMenu(categoryKey, ui);
      break;
    
    default:
      
      break;
 
  }

document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
        addToCart(e); // Gọi hàm bình thường vì cùng nằm trong module
    });
});
}


