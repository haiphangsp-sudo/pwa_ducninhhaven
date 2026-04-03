// ui/render/renderPanel.js
import { renderMenu } from "./renderCategory.js";
import { renderArticle } from "./renderArticle.js";

export function renderPanel(state) {
  const categoryKey = state.panel.view; 
  

  const ui = state.panel.option;
  // Lấy đúng đường dẫn theo state.js
  const nextPanelId = state.panel.view; 
  const langNew = state.lang.curent;
  const container = document.querySelector(".page-container");
  
  if (!container || !nextPanelId) return;

  // 1. Tìm hoặc tạo element cho panel nếu chưa có
  let panelEl = document.getElementById(nextPanelId);
  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${nextPanelId}" class="${langNew} category-panel hidden"></div>`
    );
    panelEl = document.getElementById(nextPanelId);
  }

  const langOld = container.querySelector(langNew);
  
  // 2. Chỉ vẽ lại nội dung khi panel còn trống (tránh render thừa)
  if (panelEl.innerHTML === "" || langNew!==langOld) {
    if (categoryKey) {
     ui=== "article"
        ? renderArticle(categoryKey) 
        : renderMenu(categoryKey,ui);
    }
  }

  // 3. Điều phối hiển thị (Toggle Visibility)
  document.querySelectorAll(".category-panel").forEach(el => {
    if (el.id === nextPanelId) {
      el.classList.remove("hidden",langNew);
      el.classList.add("animate-fade-in",langOld);
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-fade-in");
    }
  });
}