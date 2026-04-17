// ui/render/renderPanel.js
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderMenu.js";

export function renderPanel(state) {
  const panelId = state.panel.view;
  const ui = state.panel.option;
  const container = document.querySelector(".page-container");
  if (!container || !panelId) return;

  // tìm panel đã tồn tại
  let panel = container.querySelector(`[data-panel="${panelId}"]`);

  // ẩn tất cả
  container.querySelectorAll("[data-panel]").forEach(el => {
    el.classList.add("hidden");
  });

  // nếu chưa có thì render
  if (!panel) {
    panel = document.createElement("div");
    panel.dataset.panel = panelId;
    panel.className = "category-panel";

    panel.innerHTML =
      ui === "article"
        ? renderArticle(panelId)
        : renderMenu(panelId, ui);

    container.appendChild(panel);
  }

  // hiện panel
  panel.classList.remove("hidden");
}

export function eventPanelLang() {
  const container = document.querySelector(".category-panel");
  if (container) container.innerHTML = "";
}