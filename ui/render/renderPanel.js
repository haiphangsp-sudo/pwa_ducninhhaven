// ui/render/renderPanel.js


import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

// ui/render/renderPanel.js
export function renderPanel(state) {
  const nextPanelId = state.panel.view; 
  const container = document.querySelector(".page-container");
  
  if (!container || !nextPanelId) return;

  // 1. Tìm hoặc tạo element cho panel nếu chưa có
  let panelEl = document.getElementById(nextPanelId);
  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${nextPanelId}" class="category-panel hidden"></div>`
    );
    panelEl = document.getElementById(nextPanelId);
  }

  // 2. Chỉ vẽ lại nội dung khi panel còn trống (tránh render thừa)
  if (panelEl.innerHTML === "") {
    const category = getCategory(nextPanelId);
    if (category) {
      panelEl.innerHTML = (nextPanelId === "intro") 
        ? renderArticle(category) 
        : renderMenu(category);
    }
  }

  // 3. Điều phối hiển thị (Toggle Visibility)
  document.querySelectorAll(".category-panel").forEach(el => {
    if (el.id === nextPanelId) {
      el.classList.remove("hidden");
      el.classList.add("animate-fade-in");
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-fade-in");
    }
  });
}
