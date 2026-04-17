// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

const container = document.querySelector(".page-container");

export function showPanel(state) {
  if (!container) return;

  const panelId = state.panel.view;
  if (!panelId) return;

  // Ẩn tất cả panel trước
  showHide("panel",container);

  let panel = container.querySelector(`[data-panel="${panelId}"]`);

  // Nếu chưa có thì render mới
  if (!panel) {
    renderPanel(state,container);
    panel = container.querySelector(`[data-panel="${panelId}"]`);
  }

  if (!panel) return;

  // Hiện panel và animate nhẹ
  panel.classList.remove("hidden");
  void panel.offsetWidth;
  panel.classList.add("animate-panel-in");
}

function renderPanel(state, dom) {
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
  
  if (!container) return;

  showHide("lang",container);
  showPanel(state);
}

function showHide(action,dom) {
  dom.querySelectorAll("[data-panel]").forEach(el => {
    if (action === "lang") {
      el.remove();
    } else {
      el.classList.add("hidden");
      el.classList.remove("animate-panel-in");
    }
  
  });

}