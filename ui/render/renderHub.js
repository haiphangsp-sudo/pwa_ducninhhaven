
// ui/render/renderHub.js

import { translate } from "../utils/translate.js";
import { getCategories } from "../../core/menuQuery.js";
import { getCategoriesForMode } from "../../data/helpers.js";

export function renderHub(state) {
  const panels = getCategories();
  const menuEl = document.getElementById("hubMenu");
  if (!menuEl) return;
  const currentPanel = state.panel.view;
  menuEl.innerHTML = panels.map(cat => {
    const isActive = cat.key === currentPanel ? "is-active" : "";
    return `
    <button class="hub-btn btn center ${isActive}"
      data-action="open-panel"
      data-option="${cat.ui}"
      data-value="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg" alt="">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>
  `}).join("");
}
