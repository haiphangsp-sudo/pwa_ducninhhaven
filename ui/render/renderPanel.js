// ui/render/renderPanel.js

import { renderArticle } from "./renderArticle.js";
import { renderMenu } from "./renderCategory.js";

/* =========================
   PUBLIC
========================= */

export function renderPanel(state) {
  const panel = state.panel.view; 
  const ui = state.panel.option;

  const container = document.querySelector(".category-panel");
  
  if (!container || !panel) return;

  switch (ui) {
    case "article":
      container.innerHTML = renderArticle(panel);
      break;
  
    default:
      container.innerHTML = renderMenu( panel, ui );
      break;
 
  }
}


