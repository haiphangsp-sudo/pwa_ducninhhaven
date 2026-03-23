
// ui/render/renderHub.js

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { renderPanel } from "./renderPanel.js";
import { getCategories } from "../../core/menuQuery.js";


export function renderHub() {
  const menuEl = document.getElementById("hubMenu");
  if (!menuEl) return;

  const panels = getCategories();

  menuEl.innerHTML = panels.map(cat => `
    <button class="hub-btn btn center"
      data-action="nav-menu"
      data-value="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg" alt="">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>
  `).join("");

  const panel = UI.view.panel;
  updateActive(panel);
}

function updateActive(activeId) {
  const menuEl = document.getElementById("hubMenu");
  menuEl.querySelectorAll("[data-action]").forEach(el => {
    el.classList.toggle("is-active", el.dataset.value === activeId);
  });
}
