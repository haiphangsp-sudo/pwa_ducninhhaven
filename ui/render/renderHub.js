
// ui/render/renderHub.js

import { translate } from "../utils/translate.js";
import { getCategoriesForCurrentPlace } from "../../core/menuQuery.js";

export function renderHub(state) {
  const categories = getCategoriesForCurrentPlace();
  const menuEl = document.getElementById("hub-container");
  if (!menuEl) return;
  const currentPanel = state.panel.view;
  menuEl.innerHTML = categories.map(cat => {
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
