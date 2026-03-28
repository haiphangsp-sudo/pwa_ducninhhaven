// ui/render/renderPanel.js


import { getProducts } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

// ui/render/renderPanel.js
export function renderPanel(state) {
  const categoryKey = state.panel.view; 
  const container = document.querySelector(".page-container");
  
  if (!container || !categoryKey) return;

  // 1. Tìm hoặc tạo element cho panel nếu chưa có
  let panelEl = document.getElementById(categoryKey);
  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${categoryKey}" class="category-panel hidden"></div>`
    );
    panelEl = document.getElementById(categoryKey);
  }

  // 2. Chỉ vẽ lại nội dung khi panel còn trống (tránh render thừa)
  if (panelEl.innerHTML === "") {
    const category = getProducts(categoryKey);
    if (category ){
      panelEl.innerHTML = (categoryKey === "intro") 
        ? renderArticle(category) 
        : renderMenu(category);
    }
  }

  // 3. Điều phối hiển thị (Toggle Visibility)
  document.querySelectorAll(".category-panel").forEach(el => {
    if (el.id === categoryKey) {
      el.classList.remove("hidden");
      el.classList.add("animate-fade-in");
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-fade-in");
    }
  });
}
