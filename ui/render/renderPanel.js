// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

export function showPanel(state) {
  const container = document.querySelector(".page-container");
  if (!container) return;

  const panelId = state.panel.view;
  if (!panelId) return;

  // Ẩn tất cả panel trước
  container.querySelectorAll("[data-panel]").forEach(el => {
    el.classList.add("hidden");
    el.classList.remove("animate-panel-in");
  });

  let panel = container.querySelector(`[data-panel="${panelId}"]`);

  // Nếu chưa có thì render mới
  if (!panel) {
    renderPanel(state);
    panel = container.querySelector(`[data-panel="${panelId}"]`);
  }

  if (!panel) return;

  // Hiện panel và animate nhẹ
  panel.classList.remove("hidden");
  void panel.offsetWidth;
  panel.classList.add("animate-panel-in");
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
  showPanel(state);
}