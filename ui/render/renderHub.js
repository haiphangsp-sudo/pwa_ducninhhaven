// ui/renderHub.js

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { renderPanel } from "./renderPanel.js";
import { getCategories } from "../../core/menuQuery.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  if(!menuEl) return;

  const panels = getCategories();

  menuEl.innerHTML = panels.map(cat=>`
    <button class="hub-btn btn center is-active"
      data-action="menu"
      data-key="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>
  `).join("");

  const panel = UI.view.panel;
  renderPanel(panel);
  updateActive(panel);
}

function updateActive(acitveId) {

  document.querySelectorAll("[data-action='menu']").forEach(el =>
    el.classList.toggle("is-active",el.dataset.key === acitveId))
}

export function attachHubEvents() {

  document.addEventListener("click", e => {

    const btn = e.target.closest("[data-action]");
    if (!btn || btn.classList.contains("is-active")) return;

    switch(btn.dataset.action){
      case "menu":
        const p = btn.dataset.key;
        updateActive(p);
        setState({view: p});
        renderPanel(p);
        break;
    }
  });
}