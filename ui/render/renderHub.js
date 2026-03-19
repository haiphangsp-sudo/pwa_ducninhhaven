
// ui/render/renderHub.js

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { renderPanel } from "./renderPanel.js";
import { getCategories } from "../../core/menuQuery.js";

let hubEventsAttached = false;

export function renderHub() {
  const menuEl = document.getElementById("hubMenu");
  if (!menuEl) return;

  const panels = getCategories();

  menuEl.innerHTML = panels.map(cat => `
    <button class="hub-btn btn center"
      data-action="menu"
      data-key="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg" alt="">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>
  `).join("");

  const panel = UI.view?.panel || panels[0]?.key;
  updateActive(panel);
  renderPanel(panel);
}

function updateActive(activeId) {
  const menuEl = document.getElementById("hubMenu");
  menuEl.querySelectorAll("[data-action]").forEach(el => {
    el.classList.toggle("is-active", el.dataset.key === activeId);
  });
}

export function attachHubEvents() {
  if (hubEventsAttached) return;
  hubEventsAttached = true;

  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-action='menu']");
    if (!btn || btn.classList.contains("is-active")) return;

    const panel = btn.dataset.key;

    updateActive(panel);
    setState({
      view: {
        panel
      }
    });
    renderPanel(panel);
  });
}