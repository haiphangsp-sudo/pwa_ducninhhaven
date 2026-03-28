// ui/render/renderPanel.js

import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

// ui/render/renderPanel.js
export function renderPanel(state) {
  const panel = state.panel.view; 
  const container = document.querySelector(".page-container");
  
  if (!container || !panel) return;

  // 1. Tìm hoặc tạo element cho panel nếu chưa có
  let panelEl = document.getElementById(panel);
  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${panel}" class="category-panel hidden"></div>`
    );
    panelEl = document.getElementById(panel);
  }
  // 2. Chỉ vẽ lại nội dung khi panel còn trống (tránh render thừa)
  if (panelEl.innerHTML === "") {
    const category = getCategory(panel);
    if (!category) return;

    if (category.ui !== "article") {
      panelEl.innerHTML = renderMenu(panel);
    }else{
      panelEl.innerHTML = renderArticle(panel);
    }
  }

  // 3. Điều phối hiển thị (Toggle Visibility)
  document.querySelectorAll(".category-panel").forEach(el => {
    if (el.id === panel) {
      el.classList.remove("hidden");
      el.classList.add("animate-fade-in");
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-fade-in");
    }
  });
}
