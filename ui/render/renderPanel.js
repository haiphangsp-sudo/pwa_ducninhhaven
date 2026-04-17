// ui/render/renderPanel.js
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

export function showPanel(state) {
  
  const container = document.querySelector(".page-container");
  if (!container) return;
  const panelId = state.panel.view;
  if (!panelId) renderPanel(state);
  const panel = container.querySelector(`[data-panel="${panelId}"]`);
  if (!panel) return;
  // ẩn tất cả
  container.querySelectorAll("[data-panel]").forEach(el => {
    el.classList.add("hidden");
  });
  panel.classList.remove("hidden");
}

export function renderPanel(state) {
  const panelId = state.panel.view;
  const ui = state.panel.option;

  if (!panelId) return;
  const panel = document.createElement("div");
  panel.dataset.panel = panelId;
  panel.className = "category-panel";

  panel.innerHTML =
    ui === "article"
      ? renderArticle(panelId)
      : renderMenu(panelId, ui);
  const container = document.querySelector(".page-container");
  if (!container) return;
  container.appendChild(panel);
    
}

export function eventPanelLang(state) {
  const container = document.querySelector(".category-panel");
  if (container) container.innerHTML = "";
  renderPanel(state);
}