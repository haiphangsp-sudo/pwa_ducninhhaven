import { renderMenu } from "./renderCategory.js";
import { renderArticle } from "./renderArticle.js";

export function renderPanel(state) {
  const panelId = state.panel.view;
  const ui = state.panel.option;
  const container = document.querySelector(".category-panel");
  if (!container || !panelId) return;
  container.innerHTML =
        ui === "article"
          ? renderArticle(panelId)
          : renderMenu(panelId, ui);
    
}