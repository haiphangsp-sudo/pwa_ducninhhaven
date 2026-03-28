// ui/render/renderPanel.js

import { getCategory } from "../../core/menuQuery.js";
import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

export function renderPanel(state) {
  const panel = state.panel.view; 
  const container = document.querySelector(".page-container");
  
  if (!container || !panel) return;

    container.insertAdjacentHTML(
      "beforeend",
      `<div id="${panel}" class="category-panel stack hidden">
      ${render(state, panel)};
      </div>`
    );
}

function render(u,p) {
    if (u === "cart") {
    return  renderMenu(p);
    } else {
    return  renderArticle(p);
    }
}


