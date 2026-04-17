// ui/render/renderPanel.js
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

export function showPanel(state) {
  
  const container = document.querySelector(".page-container");
  if (!container) return;
  const panelId = state.panel.view;
  if (!panelId) return;
  const panel = container.querySelector(`[data-panel="${panelId}"]`);
  if (!panel) {
    renderPanel(state);
  } else {
    panel.classList.remove("hidden");
  }
  container.querySelectorAll("[data-panel]").forEach(el => {
    if (el.dataset.panel === panelId) return;
    el.classList.add("hidden");
  });
    
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
  const container = document.querySelector(".page-container");
  if (container) container.innerHTML = "";
  renderPanel(state);
}