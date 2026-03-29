// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

export function renderPanel(state) {
  const panel = state.panel.view; 
  const ui = state.panel.ui;

  const container = document.querySelector(".category-panel");
  
  if (!container || !panel) return;

  if (ui !== "article") {
    container.innerHTML = renderMenu( panel, ui );
  } else { //cart || instant
    container.innerHTML = renderArticle( panel, ui );
  }
}


