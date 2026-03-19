// ui/renderHub.js

import { UI, setState } from "../../core/state.js";
import { translate } from "../utils/translate.js";
import { renderPanel } from "./renderPanel.js";
import { getCategories } from "../../core/menuQuery.js";

export function renderHub(){

  const menuEl = document.getElementById("hubMenu");
  if(!menuEl) return;

  const panels = getCategories();
  const panel = UI.view.panel;

  menuEl.innerHTML = panels.map(cat=>`
    <button class="hub-btn btn center${panel===cat.key ? " is-active" : ""}"
      data-key="${cat.key}">
      <span class="hub-icon">
        <img src="/icons/${cat.key}.svg">
      </span>
      <span class="hub-label">
        ${translate(cat.label)}
      </span>
    </button>
  `).join("");
  
  renderPanel(panel);
}

export function attachHubEvents() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".hub-btn");
    if (!btn || btn.classList.contains("is-active")) return;
    const key = btn.dataset.key;
    setState({
      view: { panel: key }
    });
    renderPanel(key);
  });
}