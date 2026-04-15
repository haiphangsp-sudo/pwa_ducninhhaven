// ui/render/renderPanel.js
import { renderMenu } from "./renderCategory.js";
import { renderArticle } from "./renderArticle.js";

export function renderPanel(state) {
  const panelId = state.panel.view;
  const typePanel = state.panel.option;
  
  // Container chính để chứa nội dung
  const container = document.querySelector(".category-panel");

  if (!container || !panelId) return;

  container.innerHTML =
    typePanel === "article"
      ? renderArticle(panelId)
      : renderMenu(panelId, typePanel);
}