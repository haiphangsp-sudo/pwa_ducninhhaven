import { renderMenu } from "./renderCategory.js";
import { renderArticle } from "./renderArticle.js";

export function renderPanel(state) {
  const panelId = state.panel.view;
  const ui = state.panel.option;
  const container = document.querySelector(".page-container");

  if (!container || !panelId) return;

  let panelEl = document.getElementById(panelId);
  if (!panelEl) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${panelId}" class="category-panel hidden"></div>`
    );
    panelEl = document.getElementById(panelId);
  }

  panelEl.innerHTML =
        ui === "article"
          ? renderArticle(panelId)
          : renderMenu(panelId, ui);
    
}