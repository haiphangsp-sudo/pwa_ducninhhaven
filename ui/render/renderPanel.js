// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";


export function showPanel(state) {
  const container = getPanelContainer();
  if (!container) return;

  const panelId = state.panel.view;
  if (!panelId) return;

  hidePanels("panel",container);

  // Nếu chưa có thì render mới
  if (!container.querySelector(`[data-panel="${panelId}"]`)) {
    renderPanel(state,container);
  }
  const panel = container.querySelector(`[data-panel="${panelId}"]`);
  if (!panel) return;

  // Hiện panel và animate nhẹ
  panel.classList.remove("hidden");
  void panel.offsetWidth;
  panel.classList.add("animate-panel-in");
}

function renderPanel(state, dom=getPanelContainer()) {
  if (!dom) return;
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

  dom.appendChild(panel);
}

export function eventPanelLang(state) {
  const container = getPanelContainer();
  if (!container) return;

  hidePanels("lang",container);
  showPanel(state);
}

function hidePanels(action,dom) {
  dom.querySelectorAll("[data-panel]").forEach(el => {
    if (action === "lang") {
      el.remove();
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-panel-in");
    }
  
  });

}
function getPanelContainer() {
  return document.querySelector(".page-container");
}